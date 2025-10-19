import type { Deck } from 'core/Deck.js'
import { TextNoteField, AttachmentNoteField } from 'core/NoteField.js'
import { createAttachmentFromURL } from 'core/utils/attachments.js'
import flags from 'core/data/flags.json'

const CSS = `
main#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #003153;
  background-image: linear-gradient(315deg, #003153 0%, #1B1B1B 74%);
  font-family: helvetica;
}

hr {
  width: 60%;
  border-color: grey;
  margin: 3rem auto;
}

#content {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto 1fr;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  flex-grow: 1;
}

.flag {
  width: 100%;
  max-height: 12rem;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  align-self: flex-end;
}

h1 {
  font-size: 2rem;
  text-align: center;
  align-self: flex-end;
  color: white;
}

.fade-in {
  animation: fadein 0.5s;
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
}

h1.front {
  align-self: flex-end;
}

h1.back {
  align-self: flex-start;
}

#controls {
  display: flex;
  justify-content: center;
  padding: 1rem;
}
`

const frontTemplate = `
<div id="content">
  <div id="front" class="flag fade-in" style="background-image: url({{ flag }})">
  </div>
  <hr />
</div>
<div id="controls">
  <reveal-button />
</div>
`

const backTemplate = `
<div id="content">
  <div id="front" class="flag" style="background-image: url({{ flag }})">
  </div>
  <hr style="width: 60%"/>
  <h1 class="back fade-in">{{country}}</h1>
</div>
<div id="controls">
  <rating-buttons />
</div>
`

export const createFlagsDeck = async (deck: Deck) => {
  deck.setName('Flags of the World')

  const noteType = deck.createNewNoteType('Flag and Country')

  const countryField = noteType.createNewField('country', TextNoteField, {})
  const flagField = noteType.createNewField('flag', AttachmentNoteField, { mimetype: 'image/*' })

  for (const { country, url } of flags) {
    const note = noteType.createNewNote()
    countryField.getOrCreateContent(note).setContent(country)
    flagField.getOrCreateContent(note).setContent(await createAttachmentFromURL(url))
  }

  const cardTemplate = noteType.createNewCardTemplate('Flag to Country')
  const defaultVariant = cardTemplate.getDefaultVariant()
  defaultVariant.setCSS(CSS)
  defaultVariant.setFront(frontTemplate)
  defaultVariant.setBack(backTemplate)

  deck.createMissingCards()
  return deck
}
