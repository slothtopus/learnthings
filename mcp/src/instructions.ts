/**
 * Sent to the model in the initialize result, so it understands the shape of a
 * learnthings deck before calling anything. Concrete per-deck detail — real
 * field names and what they hold — comes from describe_deck.
 */
export const INSTRUCTIONS = `
learnthings is a flashcard app built on spaced repetition. How its pieces fit
together is worth knowing before you change anything.

A DECK is the top-level container, roughly "a subject I am studying". It is a
database of its own and syncs independently.

A NOTE TYPE is a schema inside a deck: a named set of FIELDS. A deck usually has
a few, for example a plain "text-to-text" type and a richer "image-to-text" one.

A FIELD is one slot of content, with a kind — text, image, audio, or generated
audio from text. Every field has two names, which is the thing to get right:

  - a display name, meant for people, which can contain spaces and punctuation
  - a slug, which card templates reference as {{slug}}

They are separate so a field can be renamed without breaking its templates.
describe_deck shows both, but the slug is the identifier: it is what create_note
takes, because one field's display name can be another field's slug and guessing
between them would write to the wrong field.
A field may also carry a description saying what belongs in it. Read those:
field names alone are often ambiguous, and a field called "explanation" may well
hold the answer rather than a definition.

A NOTE is one row of content: a single set of field values for a note type.
Think "one fact I want to learn". A note is not itself a flashcard.

A CARD TEMPLATE belongs to a note type and describes how to turn a note into a
flashcard, as HTML with a front and a back. It pulls content in with {{slug}}.
One note type can have several — a vocabulary type might have one template
asking foreign-to-native and another asking native-to-foreign.

A CARD is what actually gets reviewed, and is generated automatically: one card
per note per card template. Adding a note to a type with two templates creates
two cards. You never create cards directly.

A VARIANT is an alternative styling of a card template, which is why templates
list variants; "default" is the usual one.

So: deck > note type > fields define the shape; a note fills that shape in; card
templates turn each note into one or more cards to review.

WORKING WITH THIS SERVER

Sync first. sync_decks copies decks between the server and this machine in a
single pass and loads them; nothing else can see a deck until it has run. It
leaves no background replication, so run it again to pick up remote changes and
to push local ones.

Changes you make are local until the next sync_decks. Say so rather than
implying a note has reached the user's other devices.

Before creating notes, call describe_deck and use the field descriptions. If no
field obviously fits a value, ask rather than guessing: putting an answer in a
prompt field produces a card that looks right and teaches the wrong thing.

Only text fields can be filled at the moment. Image and audio fields are
reported as read-only, and generated audio fields fill themselves from a text
field once the note exists.
`.trim();
