import { Deck } from './Deck'
import { Note, NoteFieldContent } from './Note'

const sampleDeck = new Deck({
  id: 0,
  name: 'Countries and Capitals',
  noteTypes: [
    {
      id: 0,
      name: 'Country and Capital',
      fields: [
        { id: 1, name: 'country', mimeType: 'text/plain' },
        { id: 2, name: 'capital', mimeType: 'text/plain' }
      ],
      cards: [
        {
          id: 4,
          name: 'Capital -> Country',
          frontTemplate: '<h1 class="front">{{capital}}</h1>\n<hr/>\n',
          backTemplate:
            '<h1 class="front">{{capital}}</h1>\n<hr/>\n<h1 class="back">{{country}}</h1>\n',
          css: "main {\n  height: 100%;\n  display: grid;\n  grid-template-rows: 1fr auto 1fr;\n  grid-template-columns: 1fr;\n  grid-template-areas: 'front' 'hr' 'back';\n  justify-items: center;\n  align-items: center;\n  background-color: rgb(30,30,30);\n  color: white;\n}\n\nhr {\n  width: 100%;\n}\n\nh1 {\n  font-size: 3rem;\n  text-align: center;\n  margin: 0 1rem;\n}\n\nh1.front {\n  grid-area: front;\n}\n\nh1.back {\n  grid-area: back;\n  animation: fade 0.5s;\n}\n"
        },
        {
          id: 3,
          name: 'Country -> Capital',
          frontTemplate: '<h1 class="front">{{country}}</h1>\n<hr/>\n',
          backTemplate:
            '<h1 class="front">{{country}}</h1>\n<hr/>\n<h1 class="back">{{capital}}</h1>\n',
          css: "main {\n  height: 100%;\n  display: grid;\n  grid-template-rows: 1fr auto 1fr;\n  grid-template-columns: 1fr;\n  grid-template-areas: 'front' 'hr' 'back';\n  justify-items: center;\n  align-items: center;\n  background-color: rgb(30,30,30);\n  color: white;\n}\n\nhr {\n  width: 100%;\n}\n\nh1 {\n  font-size: 3rem;\n  text-align: center;\n  margin: 0 1rem;\n}\n\nh1.front {\n  grid-area: front;\n}\n\nh1.back {\n  grid-area: back;\n  animation: fade 0.5s;\n}\n"
        }
      ]
    }
  ],
  notes: [],
  nextInternalId: 5
})

const notes = [
  { country: 'Afghanistan', capital: 'Kabul' },
  { country: 'Albania', capital: 'Tirana' },
  { country: 'Algeria', capital: 'Algiers' },
  { country: 'Andorra', capital: 'Andorra la Vella' },
  { country: 'Angola', capital: 'Luanda' },
  { country: 'Antigua and Barbuda', capital: "Saint John's" },
  { country: 'Argentina', capital: 'Buenos Aires' },
  { country: 'Armenia', capital: 'Yerevan' },
  { country: 'Australia', capital: 'Canberra' },
  { country: 'Austria', capital: 'Vienna' },
  { country: 'Azerbaijan', capital: 'Baku' },
  { country: 'The Bahamas', capital: 'Nassau' },
  { country: 'Bahrain', capital: 'Manama' },
  { country: 'Bangladesh', capital: 'Dhaka' },
  { country: 'Barbados', capital: 'Bridgetown' },
  { country: 'Belarus', capital: 'Minsk' },
  { country: 'Belgium', capital: 'Brussels' },
  { country: 'Belize', capital: 'Belmopan' },
  { country: 'Benin', capital: 'Porto-Novo' },
  { country: 'Bhutan', capital: 'Thimphu' },
  { country: 'Bolivia', capital: 'La Paz (administrative); Sucre (judicial)' },
  { country: 'Bosnia and Herzegovina', capital: 'Sarajevo' },
  { country: 'Botswana', capital: 'Gaborone' },
  { country: 'Brazil', capital: 'Brasilia' },
  { country: 'Brunei', capital: 'Bandar Seri Begawan' },
  { country: 'Bulgaria', capital: 'Sofia' },
  { country: 'Burkina Faso', capital: 'Ouagadougou' },
  { country: 'Burundi', capital: 'Gitega (changed from Bujumbura in December 2018)' },
  { country: 'Cambodia', capital: 'Phnom Penh' },
  { country: 'Cameroon', capital: 'Yaounde' },
  { country: 'Canada', capital: 'Ottawa' },
  { country: 'Cape Verde', capital: 'Praia' },
  { country: 'Central African Republic', capital: 'Bangui' },
  { country: 'Chad', capital: "N'Djamena" },
  { country: 'Chile', capital: 'Santiago' },
  { country: 'China', capital: 'Beijing' },
  { country: 'Colombia', capital: 'Bogota' },
  { country: 'Comoros', capital: 'Moroni' },
  { country: 'Congo, Republic of the', capital: 'Brazzaville' },
  { country: 'Congo, Democratic Republic of the', capital: 'Kinshasa' },
  { country: 'Costa Rica', capital: 'San Jose' },
  { country: "Cote d'Ivoire", capital: 'Yamoussoukro (official); Abidjan (de facto)' },
  { country: 'Croatia', capital: 'Zagreb' },
  { country: 'Cuba', capital: 'Havana' },
  { country: 'Cyprus', capital: 'Nicosia' },
  { country: 'Czech Republic', capital: 'Prague' },
  { country: 'Denmark', capital: 'Copenhagen' },
  { country: 'Djibouti', capital: 'Djibouti' },
  { country: 'Dominica', capital: 'Roseau' },
  { country: 'Dominican Republic', capital: 'Santo Domingo' },
  { country: 'East Timor (Timor-Leste)', capital: 'Dili' },
  { country: 'Ecuador', capital: 'Quito' },
  { country: 'Egypt', capital: 'Cairo' },
  { country: 'El Salvador', capital: 'San Salvador' },
  { country: 'Equatorial Guinea', capital: 'Malabo' },
  { country: 'Eritrea', capital: 'Asmara' },
  { country: 'Estonia', capital: 'Tallinn' },
  { country: 'Ethiopia', capital: 'Addis Ababa' },
  { country: 'Fiji', capital: 'Suva' },
  { country: 'Finland', capital: 'Helsinki' },
  { country: 'France', capital: 'Paris' },
  { country: 'Gabon', capital: 'Libreville' },
  { country: 'The Gambia', capital: 'Banjul' },
  { country: 'Georgia', capital: 'Tbilisi' },
  { country: 'Germany', capital: 'Berlin' },
  { country: 'Ghana', capital: 'Accra' },
  { country: 'Greece', capital: 'Athens' },
  { country: 'Grenada', capital: "Saint George's" },
  { country: 'Guatemala', capital: 'Guatemala City' },
  { country: 'Guinea', capital: 'Conakry' },
  { country: 'Guinea-Bissau', capital: 'Bissau' },
  { country: 'Guyana', capital: 'Georgetown' },
  { country: 'Haiti', capital: 'Port-au-Prince' },
  { country: 'Honduras', capital: 'Tegucigalpa' },
  { country: 'Hungary', capital: 'Budapest' },
  { country: 'Iceland', capital: 'Reykjavik' },
  { country: 'India', capital: 'New Delhi' },
  { country: 'Indonesia', capital: 'Jakarta' },
  { country: 'Iran', capital: 'Tehran' },
  { country: 'Iraq', capital: 'Baghdad' },
  { country: 'Ireland', capital: 'Dublin' },
  { country: 'Israel', capital: 'Jerusalem*' },
  { country: 'Italy', capital: 'Rome' },
  { country: 'Jamaica', capital: 'Kingston' },
  { country: 'Japan', capital: 'Tokyo' },
  { country: 'Jordan', capital: 'Amman' },
  { country: 'Kazakhstan', capital: 'Nur-Sultan' },
  { country: 'Kenya', capital: 'Nairobi' },
  { country: 'Kiribati', capital: 'Tarawa Atoll' },
  { country: 'Korea, North', capital: 'Pyongyang' },
  { country: 'Korea, South', capital: 'Seoul' },
  { country: 'Kosovo', capital: 'Pristina' },
  { country: 'Kuwait', capital: 'Kuwait City' },
  { country: 'Kyrgyzstan', capital: 'Bishkek' },
  { country: 'Laos', capital: 'Vientiane' },
  { country: 'Latvia', capital: 'Riga' },
  { country: 'Lebanon', capital: 'Beirut' },
  { country: 'Lesotho', capital: 'Maseru' },
  { country: 'Liberia', capital: 'Monrovia' },
  { country: 'Libya', capital: 'Tripoli' },
  { country: 'Liechtenstein', capital: 'Vaduz' },
  { country: 'Lithuania', capital: 'Vilnius' },
  { country: 'Luxembourg', capital: 'Luxembourg' },
  { country: 'Macedonia', capital: 'Skopje' },
  { country: 'Madagascar', capital: 'Antananarivo' },
  { country: 'Malawi', capital: 'Lilongwe' },
  { country: 'Malaysia', capital: 'Kuala Lumpur' },
  { country: 'Maldives', capital: 'Male' },
  { country: 'Mali', capital: 'Bamako' },
  { country: 'Malta', capital: 'Valletta' },
  { country: 'Marshall Islands', capital: 'Majuro' },
  { country: 'Mauritania', capital: 'Nouakchott' },
  { country: 'Mauritius', capital: 'Port Louis' },
  { country: 'Mexico', capital: 'Mexico City' },
  { country: 'Micronesia, Federated States of', capital: 'Palikir' },
  { country: 'Moldova', capital: 'Chisinau' },
  { country: 'Monaco', capital: 'Monaco' },
  { country: 'Mongolia', capital: 'Ulaanbaatar' },
  { country: 'Montenegro', capital: 'Podgorica' },
  { country: 'Morocco', capital: 'Rabat' },
  { country: 'Mozambique', capital: 'Maputo' },
  {
    country: 'Myanmar (Burma)',
    capital: 'Rangoon (Yangon); Naypyidaw or Nay Pyi Taw (administrative)'
  },
  { country: 'Namibia', capital: 'Windhoek' },
  { country: 'Nauru', capital: 'no official capital; government offices in Yaren District' },
  { country: 'Nepal', capital: 'Kathmandu' },
  { country: 'Netherlands', capital: 'Amsterdam; The Hague (seat of government)' },
  { country: 'New Zealand', capital: 'Wellington' },
  { country: 'Nicaragua', capital: 'Managua' },
  { country: 'Niger', capital: 'Niamey' },
  { country: 'Nigeria', capital: 'Abuja' },
  { country: 'Norway', capital: 'Oslo' },
  { country: 'Oman', capital: 'Muscat' },
  { country: 'Pakistan', capital: 'Islamabad' },
  { country: 'Palau', capital: 'Melekeok' },
  { country: 'Panama', capital: 'Panama City' },
  { country: 'Papua New Guinea', capital: 'Port Moresby' },
  { country: 'Paraguay', capital: 'Asuncion' },
  { country: 'Peru', capital: 'Lima' },
  { country: 'Philippines', capital: 'Manila' },
  { country: 'Poland', capital: 'Warsaw' },
  { country: 'Portugal', capital: 'Lisbon' },
  { country: 'Qatar', capital: 'Doha' },
  { country: 'Romania', capital: 'Bucharest' },
  { country: 'Russia', capital: 'Moscow' },
  { country: 'Rwanda', capital: 'Kigali' },
  { country: 'Saint Kitts and Nevis', capital: 'Basseterre' },
  { country: 'Saint Lucia', capital: 'Castries' },
  { country: 'Saint Vincent and the Grenadines', capital: 'Kingstown' },
  { country: 'Samoa', capital: 'Apia' },
  { country: 'San Marino', capital: 'San Marino' },
  { country: 'Sao Tome and Principe', capital: 'Sao Tome' },
  { country: 'Saudi Arabia', capital: 'Riyadh' },
  { country: 'Senegal', capital: 'Dakar' },
  { country: 'Serbia', capital: 'Belgrade' },
  { country: 'Seychelles', capital: 'Victoria' },
  { country: 'Sierra Leone', capital: 'Freetown' },
  { country: 'Singapore', capital: 'Singapore' },
  { country: 'Slovakia', capital: 'Bratislava' },
  { country: 'Slovenia', capital: 'Ljubljana' },
  { country: 'Solomon Islands', capital: 'Honiara' },
  { country: 'Somalia', capital: 'Mogadishu' },
  {
    country: 'South Africa',
    capital: 'Pretoria (administrative); Cape Town (legislative); Bloemfontein (judiciary)'
  },
  { country: 'South Sudan', capital: 'Juba ' },
  { country: 'Spain', capital: 'Madrid' },
  { country: 'Sri Lanka', capital: 'Colombo; Sri Jayewardenepura Kotte (legislative)' },
  { country: 'Sudan', capital: 'Khartoum' },
  { country: 'Suriname', capital: 'Paramaribo' },
  { country: 'Swaziland', capital: 'Mbabane' },
  { country: 'Sweden', capital: 'Stockholm' },
  { country: 'Switzerland', capital: 'Bern' },
  { country: 'Syria', capital: 'Damascus' },
  { country: 'Taiwan', capital: 'Taipei' },
  { country: 'Tajikistan', capital: 'Dushanbe' },
  { country: 'Tanzania', capital: 'Dar es Salaam; Dodoma (legislative)' },
  { country: 'Thailand', capital: 'Bangkok' },
  { country: 'Togo', capital: 'Lome' },
  { country: 'Tonga', capital: "Nuku'alofa" },
  { country: 'Trinidad and Tobago', capital: 'Port-of-Spain' },
  { country: 'Tunisia', capital: 'Tunis' },
  { country: 'Turkey', capital: 'Ankara' },
  { country: 'Turkmenistan', capital: 'Ashgabat' },
  { country: 'Tuvalu', capital: 'Vaiaku village, Funafuti province' },
  { country: 'Uganda', capital: 'Kampala' },
  { country: 'Ukraine', capital: 'Kyiv' },
  { country: 'United Arab Emirates', capital: 'Abu Dhabi' },
  { country: 'United Kingdom', capital: 'London' },
  { country: 'United States of America', capital: 'Washington, D.C.' },
  { country: 'Uruguay', capital: 'Montevideo' },
  { country: 'Uzbekistan', capital: 'Tashkent' },
  { country: 'Vanuatu', capital: 'Port-Vila' },
  { country: 'Vatican City (Holy See)', capital: 'Vatican City' },
  { country: 'Venezuela', capital: 'Caracas' },
  { country: 'Vietnam', capital: 'Hanoi' },
  { country: 'Yemen', capital: 'Sanaa' },
  { country: 'Zambia', capital: 'Lusaka' },
  { country: 'Zimbabwe', capital: 'Harare' }
]

export const addNoteToSampleDeck = async (
  deck: Deck,
  { country, capital }: { country: string; capital: string }
) => {
  const noteType = deck.noteTypes[0]
  const note = await Note.service.addNew(Note.createNewEmpty(noteType))
  note.content = [
    new NoteFieldContent({ id: 1, content: country }),
    new NoteFieldContent({ id: 2, content: capital })
  ]
  await note.persist()
}

export const addSampleDeck = async () => {
  const deck = await Deck.service.createOne(sampleDeck)
  for (const content of notes) {
    await addNoteToSampleDeck(deck, content)
  }
}
