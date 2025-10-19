import type { Deck } from 'core/Deck.js'
import { TextNoteField } from 'core/NoteField.js'
import littlePrince from 'core/data/little_prince_first_3_chapters_chunks.json'

const CSS = `
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
  padding: 4rem;
  flex-grow: 1;
  margin: 0 auto;
}

p {
  font-size: 1.5rem;
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

const FRONT = `
<span class="order">{{note:order}}</span>
<div id="content">
  <p class="front fade-in">{{{ prompt_part }}}</p>
  <hr />
</div>
<div id="controls">
  <reveal-button />
</div>
`

const BACK = `
<span class="order">{{note:order}}</span>
<div id="content">
  <p class="front">{{{ prompt_part }}}</p>
  <hr />
  <p class="back fade-in">{{{ next_part }}}</p>
</div>
<div id="controls">
  <rating-buttons />
</div>
`

export const createLittlePrince = async (deck: Deck) => {
  deck.setName('O Pequeno Príncipe')
  const noteType = deck.createNewNoteType('sentences')
  const promptField = noteType.createNewField('prompt_part', TextNoteField, {})
  const nextField = noteType.createNewField('next_part', TextNoteField, {})

  for (let i = 0; i < littlePrince.length - 2; i++) {
    const note = noteType.createNewNote()
    note.setOrder(i + 1)
    promptField.getOrCreateContent(note).setContent(littlePrince[i])
    nextField.getOrCreateContent(note).setContent(littlePrince[i + 1])
  }

  const defaultVariant = noteType.createNewCardTemplate('prompt to next').getDefaultVariant()
  defaultVariant.setCSS(CSS)
  defaultVariant.setFront(FRONT)
  defaultVariant.setBack(BACK)

  deck.createMissingCards()
  return deck
}
