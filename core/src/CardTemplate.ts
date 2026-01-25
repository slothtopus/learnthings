import { PersistableObject } from "./PersistableObject";
import { cacheByVersion, ObjectManager } from "./ObjectManager";
import type { Note } from "./Note";
import type { NoteFieldContent } from "./NoteField";
import type { NoteType } from "./NoteType";
import { TextNoteFieldContent, AttachmentNoteFieldContent } from "./NoteField";
import type { PersistedObject, NoReservedKeys } from "./PersistableObject";

import Handlebars from "handlebars";
import { isEqual } from "lodash-es";
import type { AttachmentData } from "./utils/attachments";
import { AttachmentDocument } from "./Attachment";
import type { SerialisedAttachmentDocument } from "./Attachment";

//##########################################################################
export type RenderedContent = Record<string, string>;

export class RenderedCard {
  html: string;
  css: string;
  context: Record<string, string>;

  constructor({
    html,
    css,
    context,
  }: {
    html: string;
    css: string;
    context: Record<string, string>;
  }) {
    this.html = html;
    this.css = css;
    this.context = context;
  }
}

export type SerialisedCardTemplate = {
  name: string;
  noteTypeId: string;
  defaultVariantId?: string;
} & PersistedObject;

export class CardTemplate extends PersistableObject<SerialisedCardTemplate> {
  static doctype = "cardtemplate";
  static subtype = "new";

  shouldPersistIfUnsaved = true;

  name!: string;
  noteTypeId!: string;
  defaultVariantId?: string;

  get noteType() {
    return this.objectManager.getObjectById(this.noteTypeId) as NoteType;
  }

  static createNew(
    objectManager: ObjectManager,
    options: {
      name: string;
      noteTypeId: string;
    }
  ) {
    return new CardTemplate(
      {
        ...PersistableObject.create(),
        ...options,
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedCardTemplate,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    this.updateFrom(serialised);
  }

  updateFrom(serialised: SerialisedCardTemplate) {
    const { name, noteTypeId, defaultVariantId } = serialised;
    this.name = name;
    this.noteTypeId = noteTypeId;
    this.defaultVariantId = defaultVariantId;
  }

  @cacheByVersion(["cardtemplateblock"])
  getCardTemplateScopedBlocks() {
    return this.objectManager.query({
      include: { doctype: "cardtemplateblock", cardTemplateId: this.id },
    }) as CardTemplateBlock[];
  }

  @cacheByVersion(["cardtemplateblock"])
  getNoteTypeScopedBlocks() {
    return this.objectManager.query({
      include: { doctype: "cardtemplateblock", noteTypeId: this.noteTypeId },
    }) as CardTemplateBlock[];
  }

  @cacheByVersion(["cardtemplateblock"])
  getDeckScopedBlocks() {
    return this.objectManager.query({
      include: { doctype: "cardtemplateblock", deckId: this.deck.id },
    }) as CardTemplateBlock[];
  }

  @cacheByVersion(["cardtemplateattachment"])
  getAllAttachments() {
    return this.objectManager.query({
      include: { doctype: "cardtemplateattachment", cardTemplateId: this.id },
    }) as CardTemplateAttachment[];
  }

  @cacheByVersion(["cardtemplatevariant"])
  getAllVariants() {
    const variants = this.objectManager.query({
      include: { doctype: "cardtemplatevariant", cardTemplateId: this.id },
    }) as CardTemplateVariant[];
    if (variants.length === 0) {
      const defaultVariant = CardTemplateVariant.createNew(this.objectManager, {
        name: "default",
        cardTemplateId: this.id,
      });
      return [this.objectManager.setObject(defaultVariant)];
    } else {
      return variants;
    }
  }

  getDefaultVariant() {
    let variant = this.defaultVariantId
      ? this.objectManager.getObjectById(this.defaultVariantId)
      : undefined;
    variant = variant ?? this.getAllVariants()[0];
    if (variant.id !== this.defaultVariantId) {
      this.setDefaultVariantId(variant.id);
    }
    return variant as CardTemplateVariant;
  }

  setDefaultVariantId(id: string) {
    if (id !== this.defaultVariantId) this.markDirty();
    this.defaultVariantId = id;
  }

  createNewBlock(name: string, scope: "deck" | "notetype" | "template") {
    let block: CardTemplateBlock;
    switch (scope) {
      case "deck":
        block = CardTemplateBlock.createNew(this.objectManager, {
          name,
          deckId: this.deck.id,
        });
        break;
      case "notetype":
        block = CardTemplateBlock.createNew(this.objectManager, {
          name,
          noteTypeId: this.noteTypeId,
        });
        break;
      case "template":
        block = CardTemplateBlock.createNew(this.objectManager, {
          name,
          cardTemplateId: this.id,
        });
        break;
    }
    return this.objectManager.setObject(block);
  }

  createNewVariant(name: string) {
    const variant = CardTemplateVariant.createNew(this.objectManager, {
      name,
      cardTemplateId: this.id,
    });
    return this.objectManager.setObject(variant);
  }

  createNewAttachment(attachment: AttachmentData) {
    const cta = CardTemplateAttachment.createNew(this.objectManager, {
      cardTemplateId: this.id,
      attachment,
    });
    this.markDirty();
    return this.objectManager.setObject(cta);
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCardTemplate {
    return {
      ...super.serialise(...args),
      noteTypeId: this.noteTypeId,
      defaultVariantId: this.defaultVariantId,
      name: this.name,
    };
  }

  async renderFieldContent(fieldContent: NoteFieldContent<any, any>) {
    const name = fieldContent.field.name;
    if (fieldContent instanceof TextNoteFieldContent) {
      return { name, content: fieldContent.content || "" };
    } else if (fieldContent instanceof AttachmentNoteFieldContent) {
      const attachment = await fieldContent.fetchAttachment();
      if (attachment) {
        const { data } = attachment;
        return {
          name,
          content: URL.createObjectURL(data),
        };
      } else {
        return {
          name,
          content: null,
        };
      }
    } else {
      throw new Error(`Field content ${fieldContent.doctype} not known`);
    }
  }

  async renderAllFieldContent(note: Note) {
    const fieldContent = note.getAllFieldContent();
    const renderedContent: RenderedContent = {};
    for (const content of fieldContent) {
      const rendered = await this.renderFieldContent(content);
      if (rendered.content === null) continue;
      renderedContent[rendered.name] = rendered.content;
    }
    return renderedContent;
  }

  _handlebars: typeof Handlebars | undefined;
  get handlebars() {
    if (this._handlebars === undefined) {
      this._handlebars = Handlebars.create();
    }
    return this._handlebars;
  }

  registerAllPartials() {
    const blocks = this.getDeckScopedBlocks()
      .concat(this.getNoteTypeScopedBlocks())
      .concat(this.getCardTemplateScopedBlocks());
    blocks.forEach((b) => {
      this.handlebars.registerPartial(b.name, b.content);
    });
  }

  async renderAllAttachments() {
    const attachments = await Promise.all(
      this.getAllAttachments().map((a) => a.renderContext())
    );
    return Object.assign({}, ...attachments);
  }

  async renderCard(
    template: string,
    css: string,
    renderedContent: RenderedContent,
    additionalContext: Record<string, string> = {}
  ) {
    let renderedCard = new RenderedCard({ html: "", css: css, context: {} });
    try {
      this.registerAllPartials();
      const attachments = await this.renderAllAttachments();
      const compiledCSS = this.handlebars.compile(css);
      const compiledTemplate = this.handlebars.compile(template);
      const context = {
        ...renderedContent,
        ...additionalContext,
        ...attachments,
      };
      renderedCard = new RenderedCard({
        html: compiledTemplate(context),
        css: compiledCSS(context),
        context,
      });
    } catch (err) {
      console.error(err);
    }
    return renderedCard;
  }

  async renderFront(
    note: Note,
    additionalContext: Record<string, string>,
    _variant?: CardTemplateVariant
  ) {
    const variant = _variant ?? this.getDefaultVariant();
    const content = await this.renderAllFieldContent(note);
    return this.renderCard(
      variant.front,
      variant.css,
      content,
      Object.assign(additionalContext, note.getInternalContext())
    );
  }

  async renderBack(
    note: Note,
    additionalContext: Record<string, string>,
    _variant?: CardTemplateVariant
  ) {
    const variant = _variant ?? this.getDefaultVariant();
    const content = await this.renderAllFieldContent(note);
    return this.renderCard(
      variant.back,
      variant.css,
      content,
      Object.assign(additionalContext, note.getInternalContext())
    );
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager
      .query({
        include: {
          cardTemplateId: this.id,
        },
      })
      .forEach((c) => c.flagShouldDelete(true));
  }
}

//##########################################################################
export type SerialisedCardTemplateBlock = {
  name: string;
  cardTemplateId?: string;
  noteTypeId?: string;
  deckId?: string;
  content: string;
} & PersistedObject;

export class CardTemplateBlock extends PersistableObject<SerialisedCardTemplateBlock> {
  static doctype = "cardtemplateblock";
  static subtype = "base";

  shouldPersistIfUnsaved = true;

  name!: string;
  cardTemplateId?: string;
  noteTypeId?: string;
  deckId?: string;
  content = "";

  get relatedIds(): string[] {
    if (this.cardTemplateId) {
      return [this.cardTemplateId];
    } else if (this.noteTypeId) {
      return [this.noteTypeId];
    } else if (this.deckId) {
      return [this.deckId];
    } else {
      return ["neverfound"];
    }
  }

  static createNew(
    objectManager: ObjectManager,
    options: {
      name: string;
      deckId?: string;
      cardTemplateId?: string;
      noteTypeId?: string;
    }
  ) {
    return new CardTemplateBlock(
      {
        ...PersistableObject.create(),
        ...options,
        content: "",
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedCardTemplateBlock,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    this.updateFrom(serialised);
  }

  updateFrom(serialised: NoReservedKeys<SerialisedCardTemplateBlock>) {
    const { name, content, deckId, noteTypeId, cardTemplateId } = serialised;
    this.name = name;
    this.deckId = deckId;
    this.noteTypeId = noteTypeId;
    this.cardTemplateId = cardTemplateId;
    this.content = content;
  }

  revertToLastPersisted() {
    if (this._lastPersisted) {
      this.updateFrom(this._lastPersisted as SerialisedCardTemplateBlock);
    }
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCardTemplateBlock {
    const serialised: SerialisedCardTemplateBlock = {
      ...super.serialise(...args),
      name: this.name,
      content: this.content,
    };
    if (this.deckId) {
      serialised["deckId"] = this.deckId;
    }
    if (this.noteTypeId) {
      serialised["noteTypeId"] = this.noteTypeId;
    }
    if (this.cardTemplateId) {
      serialised["cardTemplateId"] = this.cardTemplateId;
    }
    return serialised;
  }

  setContent(content: string) {
    this.content = content;
    this.markDirty();
  }
}

//##########################################################################
export type SerialisedCardTemplateVariant = {
  name: string;
  cardTemplateId: string;
  css: string;
  front: string;
  back: string;
} & PersistedObject;

export class CardTemplateVariant extends PersistableObject<SerialisedCardTemplateVariant> {
  static doctype = "cardtemplatevariant";
  static subtype = "base";

  shouldPersistIfUnsaved = true;

  name!: string;
  cardTemplateId!: string;
  get cardTemplate() {
    return this.objectManager.getObjectById(
      this.cardTemplateId
    ) as CardTemplate;
  }

  css!: string;
  front!: string;
  back!: string;

  get relatedIds() {
    return [this.cardTemplateId];
  }

  static createNew(
    objectManager: ObjectManager,
    options: {
      name: string;
      cardTemplateId: string;
    }
  ) {
    return new CardTemplateVariant(
      {
        ...PersistableObject.create(),
        ...options,
        css: "",
        front: "",
        back: "",
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedCardTemplateVariant,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    this.updateFrom(serialised);
  }

  setCSS(css: string) {
    this.css = css;
    this.markDirty();
  }

  setFront(front: string) {
    this.front = front;
    this.markDirty();
  }

  setBack(back: string) {
    this.back = back;
    this.markDirty();
  }

  updateFrom(serialised: NoReservedKeys<SerialisedCardTemplateVariant>) {
    const { name, cardTemplateId, css, front, back } = serialised;
    this.name = name;
    this.cardTemplateId = cardTemplateId;
    this.css = css;
    this.front = front;
    this.back = back;
  }

  revertToLastPersisted() {
    if (this._lastPersisted) {
      this.updateFrom(this._lastPersisted as SerialisedCardTemplateVariant);
    }
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCardTemplateVariant {
    return {
      ...super.serialise(...args),
      name: this.name,
      cardTemplateId: this.cardTemplateId,
      css: this.css,
      front: this.front,
      back: this.back,
    };
  }

  isDefault() {
    return this.cardTemplate.getDefaultVariant().id === this.id;
  }

  @cacheByVersion(["cardwidgetsettings"])
  getAllWidgetSettings() {
    return this.objectManager.query({
      include: {
        doctype: "cardwidgetsettings",
        cardTemplateVariantId: this.id,
      },
    }) as CardWidgetSettings<any>[];
  }

  getOrCreateWidgetSettings<T>(slug: string, defaultSettings: T) {
    let widgetSettings = this.objectManager.getObjectById(
      CardWidgetSettings.generateId(this.id, slug)
    ) as CardWidgetSettings<T> | undefined;
    if (widgetSettings === undefined) {
      widgetSettings = CardWidgetSettings.createNew(this.objectManager, {
        slug,
        cardTemplateVariantId: this.id,
        settings: defaultSettings,
      });
      widgetSettings = this.objectManager.setObject(widgetSettings);
      console.log(
        `created new widget settings with id ${
          widgetSettings.id
        } and meta ${widgetSettings.getMeta()}`
      );
    } else {
      console.log(
        `got existing widget settings with id ${
          widgetSettings.id
        } and meta ${widgetSettings.getMeta()}`
      );
    }
    widgetSettings.setDefaultSettings(defaultSettings);
    return widgetSettings;
  }

  getWidgetSettingsContext() {
    const settings = this.getAllWidgetSettings();
    return settings.reduce((context, s) => {
      context[s.slug] = s.settings;
      return context;
    }, {} as Record<string, any>);
  }
}

export type SerialisedCardWidgetSettings<T> = {
  slug: string;
  cardTemplateVariantId: string;
  settings: T;
} & PersistedObject;

export class CardWidgetSettings<T> extends PersistableObject<
  SerialisedCardWidgetSettings<T>
> {
  static doctype = "cardwidgetsettings";
  static subtype = "base";

  shouldPersistIfUnsaved = true;

  cardTemplateVariantId!: string;
  slug!: string;

  settings!: T;
  _defaultSettings?: T;

  static generateId(cardTemplateVariantId: string, slug: string) {
    return [cardTemplateVariantId, slug].join("");
  }

  get relatedIds() {
    return [this.cardTemplateVariantId];
  }

  static createNew<T>(
    objectManager: ObjectManager,
    options: {
      slug: string;
      cardTemplateVariantId: string;
      settings: T;
    }
  ) {
    return new CardWidgetSettings<T>(
      {
        ...PersistableObject.create(
          CardWidgetSettings.generateId(
            options.cardTemplateVariantId,
            options.slug
          )
        ),
        ...options,
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedCardWidgetSettings<T>,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    this.updateFrom(serialised);
  }

  updateFrom(serialised: NoReservedKeys<SerialisedCardWidgetSettings<T>>) {
    const { slug, cardTemplateVariantId, settings } = serialised;
    this.slug = slug;
    this.cardTemplateVariantId = cardTemplateVariantId;
    this.settings = settings;
  }

  updateSettings(settings: T) {
    this.settings = settings;
    this.markDirty();
  }

  setDefaultSettings(settings: T) {
    this._defaultSettings = settings;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCardWidgetSettings<T> {
    return {
      ...super.serialise(...args),
      slug: this.slug,
      settings: this.settings,
      cardTemplateVariantId: this.cardTemplateVariantId,
    };
  }

  shouldDelete() {
    return (
      super.shouldDelete() || isEqual(this.settings, this._defaultSettings)
    );
  }
}

export type SerialisedCardTemplateAttachment = SerialisedAttachmentDocument & {
  cardTemplateId: string;
};

export class CardTemplateAttachment extends AttachmentDocument {
  static doctype = "cardtemplateattachment";
  static subtype = "base";

  shouldPersistIfUnsaved = true;

  cardTemplateId: string;

  static createNew(
    objectManager: ObjectManager,
    options: { cardTemplateId: string; attachment: AttachmentData }
  ) {
    const { data, ...attachmentData } = options.attachment;
    const doc = new CardTemplateAttachment(
      {
        ...PersistableObject.create(),
        cardTemplateId: options.cardTemplateId,
        attachment: attachmentData,
      },
      objectManager
    );
    doc._data = data;
    return doc;
  }

  constructor(
    serialised: SerialisedCardTemplateAttachment,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { cardTemplateId } = serialised;
    this.cardTemplateId = cardTemplateId;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCardTemplateAttachment {
    return {
      ...super.serialise(...args),
      cardTemplateId: this.cardTemplateId,
    };
  }

  getTemplateTag() {
    return `attachment:${this.attachment.filename}`;
  }

  async renderContext() {
    return {
      [this.getTemplateTag()]: await this.getObjectURL(),
    };
  }
}
