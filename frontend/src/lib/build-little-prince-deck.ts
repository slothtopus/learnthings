import type { Deck } from 'core/Deck.js'
import { TextNoteField } from 'core/NoteField.js'
import littlePrince from 'core/data/little_prince_first_3_chapters_chunks.json'

const BLOCK_CSS = `
main#root {
  display: flex;
  flex-direction: column;
  background-color: #003153;
  background-image: linear-gradient(315deg, #003153 0%, #1B1B1B 74%);
  font-family: helvetica;
  color: white;
  padding: 2rem;
}

hr {
  width: 60%;
  border-color: grey;
  margin: 2rem 0;
  place-self: center;
}

#content {
  display: grid;
  width: 100%;
  max-width: 54rem;
  grid-template-rows: 1fr auto 1fr;
  place-items: flex-start;
  flex-grow: 1;
  margin: 0 auto;
}

.sentence {
  width: 100%;
  display: flex;
  gap: 1rem;
}

.sentence + .sentence {
  margin-top: 1rem;
}

.inactive {
  font-weight: 100;
  color: grey;
}

.index {
  font-size: 1rem;
  padding-right: 1rem;
  border-right: 1px dashed grey;
  font-weight: 100;
}

p {
  font-size: 1.3rem;
  text-align: left;
  align-self: flex-end;
}

.fade-in {
  animation: fadein 0.5s;
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
}

.front {
  align-self: flex-end;
}

.back {
  align-self: flex-start;
}

.order {
  align-self: center;
  font-style: italic;
}

#controls {
  display: flex;
  justify-content: center;
}
`

const BLOCK_FRAME = `
<span class="order">{{note:order}}</span>
<div id="content">
  <section class="front {{#if front}}fade-in{{/if}}">
    {{> front_content }}
  </section>
  <hr />
  <section class="back fade-in">
    {{> back_content }}
  </section>
</div>
<div id="controls">
  {{#if front}}
    <reveal-button />
  {{else}}
    <rating-buttons />
  {{/if}}
</div>
`

const BLOCK_SENTENCE = `
<div class="sentence {{#if inactive}}inactive{{/if}}">
  <div class="index">{{ index }}</div>
  <p>{{{ sentence }}}</p>
</div>
`

export const createLittlePrince = async (deck: Deck) => {
  deck.setName('O Pequeno Príncipe')
  const noteType = deck.createNewNoteType('sentences')

  const promptFieldMinusOne = noteType.createNewField('prompt_part_minus_1', TextNoteField, {})
  const promptFieldMinusOneIndex = noteType.createNewField(
    'prompt_part_minus_1_index',
    TextNoteField,
    {},
  )
  const promptField = noteType.createNewField('prompt_part', TextNoteField, {})
  const promptFieldIndex = noteType.createNewField('prompt_part_index', TextNoteField, {})
  const nextField = noteType.createNewField('next_part', TextNoteField, {})
  const nextFieldIndex = noteType.createNewField('next_part_index', TextNoteField, {})
  const nextFieldPlusOne = noteType.createNewField('next_part_plus_1', TextNoteField, {})
  const nextFieldPlusOneIndex = noteType.createNewField('next_part_plus_1_index', TextNoteField, {})

  for (let i = 0; i < littlePrince.length - 2; i++) {
    const note = noteType.createNewNote()
    note.setOrder(i + 1)

    if (i > 0) {
      promptFieldMinusOne.getOrCreateContent(note).setContent(littlePrince[i - 1])
      promptFieldMinusOneIndex.getOrCreateContent(note).setContent(String(i - 1))
    }

    promptField.getOrCreateContent(note).setContent(littlePrince[i])
    promptFieldIndex.getOrCreateContent(note).setContent(String(i))
    nextField.getOrCreateContent(note).setContent(littlePrince[i + 1])
    nextFieldIndex.getOrCreateContent(note).setContent(String(i + 1))

    if (i < littlePrince.length - 3) {
      nextFieldPlusOne.getOrCreateContent(note).setContent(littlePrince[i + 2])
      nextFieldPlusOneIndex.getOrCreateContent(note).setContent(String(i + 2))
    }
  }

  const template = noteType.createNewCardTemplate('prompt to next')
  template.createNewBlock('css', 'template').setContent(BLOCK_CSS)
    template.createNewBlock('frame', 'template').setContent(BLOCK_FRAME)
        template.createNewBlock('sentence', 'template').setContent(BLOCK_SENTENCE)

  const defaultVariant = template.getDefaultVariant()
  defaultVariant.setCSS('{{>css}}')
  defaultVariant.setFront(`
  {{#> frame front=true }}
  {{#*inline "front_content"}}
    {{> sentence sentence=prompt_part index=prompt_part_index }}
  {{/inline}}
  {{#*inline "back_content"}}{{/inline}}
  {{/frame}}
  `)
  defaultVariant.setBack(`
  {{#> frame }}
  {{#*inline "front_content"}}
    {{> sentence sentence=prompt_part index=prompt_part_index }}
  {{/inline}}
  {{#*inline "back_content"}}
    {{> sentence sentence=next_part index=next_part_index }}
  {{/inline}}
  {{/frame}}
  `)

  const withContentVariant = template.createNewVariant('with_context')
  withContentVariant.setCSS('{{>css}}')
  withContentVariant.setFront(`
  {{#> frame front=true }}
  {{#*inline "front_content"}}
    {{> sentence sentence=prompt_part_minus_1 index=prompt_part_minus_1_index inactive=true }}
    {{> sentence sentence=prompt_part index=prompt_part_index }}
  {{/inline}}
  {{#*inline "back_content"}}
  {{/inline}}
  {{/frame}}
  `)
  withContentVariant.setBack(`
  {{#> frame }}
  {{#*inline "front_content"}}
    {{> sentence sentence=prompt_part_minus_1 index=prompt_part_minus_1_index inactive=true }}
    {{> sentence sentence=prompt_part index=prompt_part_index }}
  {{/inline}}
  {{#*inline "back_content"}}
    {{> sentence sentence=next_part index=next_part_index }}
    {{> sentence sentence=next_part_plus_1 index=next_part_plus_1_index inactive=true }}
  {{/inline}}
  {{/frame}}
  `)



  deck.createMissingCards()
  return deck
}
