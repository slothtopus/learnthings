import { PersistableObject } from "./PersistableObject";
import { cacheByVersion, ObjectManager } from "./ObjectManager";
import type { Note } from "./Note";
import type { NoteFieldContent } from "./NoteField";
import type { NoteType } from "./NoteType";
import { TextNoteFieldContent, AttachmentNoteFieldContent } from "./NoteField";
import type { PersistedObject, NoReservedKeys } from "./PersistableObject";
import Handlebars from "handlebars";

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

  static createNewEmpty(
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

  @cacheByVersion(["cardtemplatevariant"])
  getAllVariants() {
    const variants = this.objectManager.query({
      include: { doctype: "cardtemplatevariant", cardTemplateId: this.id },
    }) as CardTemplateVariant[];
    if (variants.length === 0) {
      const defaultVariant = CardTemplateVariant.createNewEmpty(
        this.objectManager,
        { name: "default", cardTemplateId: this.id }
      );
      this.objectManager.setObject(defaultVariant);
      return [defaultVariant];
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
        block = CardTemplateBlock.createNewEmpty(this.objectManager, {
          name,
          deckId: this.deck.id,
        });
        break;
      case "notetype":
        block = CardTemplateBlock.createNewEmpty(this.objectManager, {
          name,
          noteTypeId: this.noteTypeId,
        });
        break;
      case "template":
        block = CardTemplateBlock.createNewEmpty(this.objectManager, {
          name,
          cardTemplateId: this.id,
        });
        break;
    }
    this.objectManager.setObject(block);
    return block;
  }

  serialise(includeObjects = true): SerialisedCardTemplate {
    return {
      ...super.serialise(includeObjects),
      noteTypeId: this.noteTypeId,
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

  renderCard(
    template: string,
    css: string,
    renderedContent: RenderedContent,
    additionalContext: Record<string, string> = {}
  ) {
    let renderedCard = new RenderedCard({ html: "", css: css, context: {} });
    try {
      this.registerAllPartials();
      const compiledCSS = this.handlebars.compile(css);
      const compiledTemplate = this.handlebars.compile(template);
      const context = { ...renderedContent, ...additionalContext };
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

  static createNewEmpty(
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

  serialise(includeObjects?: boolean): SerialisedCardTemplateBlock {
    const serialised: SerialisedCardTemplateBlock = {
      ...super.serialise(includeObjects),
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

  name!: string;
  cardTemplateId!: string;

  css!: string;
  front!: string;
  back!: string;

  get relatedIds() {
    return [this.cardTemplateId];
  }

  static createNewEmpty(
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

  serialise(includeObjects?: boolean): SerialisedCardTemplateVariant {
    return {
      ...super.serialise(includeObjects),
      name: this.name,
      cardTemplateId: this.cardTemplateId,
      css: this.css,
      front: this.front,
      back: this.back,
    };
  }
}
