import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Place from '#models/place'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Exemple de place pour les tests
    await Place.updateOrCreate(
      { osmId: 'test-place-1' },
      {
        coordinate: db.raw("point(48.8566, 2.3522)"), // Paris
        geocoordinate: db.raw("ST_GeomFromText('POINT(2.3522 48.8566)', 4326)"),
        osmId: 'test-place-1',
        sportCenter: true,
        name: 'Arkose Nation',
        city: 'Paris',
        postalCode: '75011',
        street: 'Rue de la Roquette',
        houseNumber: '55',
        address: '55 Rue de la Roquette, 75011 Paris',
        outdoor: false,
        gradeMin: '3a',
        gradeMax: '8c',
        phone: '+33 1 23 45 67 89',
        website: 'https://arkose.com',
      }
    )

    await Place.updateOrCreate(
      { osmId: 'test-place-2' },
      {
        coordinate: db.raw("point(45.7640, 4.8357)"), // Lyon
        geocoordinate: db.raw("ST_GeomFromText('POINT(4.8357 45.7640)', 4326)"),
        osmId: 'test-place-2',
        sportCenter: true,
        name: 'Climb Up Lyon',
        city: 'Lyon',
        postalCode: '69003',
        street: 'Rue Paul Bert',
        houseNumber: '12',
        address: '12 Rue Paul Bert, 69003 Lyon',
        outdoor: false,
        gradeMin: '4a',
        gradeMax: '8a',
      }
    )

    console.log('✅ Places de test créées')
  }
}
