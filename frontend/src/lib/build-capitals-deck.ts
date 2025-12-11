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

.correct {
  color: green;
}

.incorrect {
  color: red;
  text-decoration: line-through;
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
  {{#if textinput}}
  <text-input answer="{{ back_field }}" style="align-self: flex-start"/>
  {{/if}}
</div>
<div id="controls">
  <reveal-button {{#if textinput}}style="visibility: hidden;"{{/if}} />
</div>
`

const BACK = `
<div id="content">
  <h1 class="front">{{ front_field }}</h1>
  <hr />
  {{#if textinput}}
    {{#if textinput:correct}}
      <h1 class="back fade-in correct">{{ back_field }}</h1>
    {{else}}
      <div style="align-self: flex-start">
        <h1 class="back fade-in incorrect">{{ textinput:answer }}</h1>
        <h1 class="back fade-in correct">{{ back_field }}</h1>
      </div>
    {{/if}}
  {{else}}
    <h1 class="back fade-in">{{ back_field }}</h1>
  {{/if}}
</div>
<div id="controls">
  {{#if textinput}}
    <next-button />
  {{else}}
    <rating-buttons />
  {{/if}}
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

  {
    const template = noteType.createNewCardTemplate('country to capital')
    template.createNewBlock('css', 'notetype').setContent(CSS)
    template.createNewBlock('front', 'notetype').setContent(FRONT)
    template.createNewBlock('back', 'notetype').setContent(BACK)

    const defaultVariant = template.getDefaultVariant()
    defaultVariant.setCSS('{{>css}}')
    defaultVariant.setFront('{{>front front_field=country}}')
    defaultVariant.setBack('{{>back front_field=country back_field=capital}}')

    const textInputVariant = template.createNewVariant('text input')
    textInputVariant.setCSS('{{>css}}')
    textInputVariant.setFront('{{>front front_field=country back_field=capital textinput=true}}')
    textInputVariant.setBack('{{>back front_field=country back_field=capital textinput=true}}')
  }

  {
    const template = noteType.createNewCardTemplate('capital to country')

    const defaultVariant = template.getDefaultVariant()
    defaultVariant.setCSS('{{>css}}')
    defaultVariant.setFront('{{>front front_field=capital}}')
    defaultVariant.setBack('{{>back front_field=capital back_field=country}}')

    const textInputVariant = template.createNewVariant('text input')
    textInputVariant.setCSS('{{>css}}')
    textInputVariant.setFront('{{>front front_field=capital back_field=capital textinput=true}}')
    textInputVariant.setBack('{{>back front_field=capital back_field=country textinput=true}}')
  }

  deck.createMissingCards()
  return deck
}
