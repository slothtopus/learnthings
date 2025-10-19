import type { Deck } from 'core/Deck.js'
import { TextNoteField } from 'core/NoteField.js'
import capitals from 'core/data/capitals.json'

const CSS = `
main#root {
  display: flex;
  flex-direction: column;
  background-color: #003153;
  background-image: linear-gradient(315deg, #003153 0%, #1B1B1B 74%);
  font-family: helvetica;
}

hr {
  width: 60%;
  border-color: grey;
  margin: 2rem 0;
}

#content {
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  place-items: center;
  padding: 4rem;
  flex-grow: 1;
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
  padding: 1rem 1rem 2rem 1rem;
}
`

const FRONT = `
<div id="content">
  <h1 class="front fade-in">{{ front_field }}</h1>
  <hr />
</div>
<div id="controls">
  <reveal-button />
</div>
`

const BACK = `
<div id="content">
  <h1 class="front">{{ front_field }}</h1>
  <hr />
  <h1 class="back fade-in">{{ back_field }}</h1>
</div>
<div id="controls">
  <rating-buttons />
</div>

`

export const createCountriesAndCapitals = async (deck: Deck) => {
  deck.setName('Countries and Capitals')
  const noteType = deck.createNewNoteType('Countries and Capitals')
  const countryField = noteType.createNewField('country', TextNoteField, {})
  const capitalField = noteType.createNewField('capital', TextNoteField, {})

  for (const { country, capital } of capitals) {
    const note = noteType.createNewNote()
    countryField.getOrCreateContent(note).setContent(country)
    capitalField.getOrCreateContent(note).setContent(capital)
  }

  const co2caTemplate = noteType.createNewCardTemplate('country to capital')
  co2caTemplate.createNewBlock('css', 'notetype').setContent(CSS)
  co2caTemplate.createNewBlock('front', 'notetype').setContent(FRONT)
  co2caTemplate.createNewBlock('back', 'notetype').setContent(BACK)

  const co2caDefaultVariant = co2caTemplate.getDefaultVariant()
  co2caDefaultVariant.setCSS('{{>css}}')
  co2caDefaultVariant.setFront('{{>front front_field=country}}')
  co2caDefaultVariant.setBack('{{>back front_field=country back_field=capital}}')

  const ca2coTemplate = noteType.createNewCardTemplate('capital to country')
  const ca2coDefaultVariant = ca2coTemplate.getDefaultVariant()
  ca2coDefaultVariant.setCSS('{{>css}}')
  ca2coDefaultVariant.setFront('{{>front front_field=capital}}')
  ca2coDefaultVariant.setBack('{{>back front_field=capital back_field=country}}')

  deck.createMissingCards()
  return deck
}
