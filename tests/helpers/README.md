# Test Helpers

Helpers pour faciliter la création de données de test.

## Créer des utilisateurs

### Utilisateur normal

```typescript
import { createUser } from '#tests/helpers/create_user'

const user = await createUser({
  email: 'test@example.com',
  password: 'password123',
  firstname: 'John',
  lastname: 'Doe',
})
```

### Utilisateur admin

```typescript
import { createAdminUser } from '#tests/helpers/create_user'

// Avec email et password par défaut
const admin = await createAdminUser()

// Avec email et password personnalisés
const admin = await createAdminUser('admin@example.com', 'secret123')
```

## Exemple dans un test

```typescript
import { test } from '@japa/runner'
import { createAdminUser } from '#tests/helpers/create_user'

test.group('Contests with admin', (group) => {
  let adminUser: any
  let adminToken: string

  group.each.setup(async ({ context }) => {
    if (!adminUser) {
      // Créer un utilisateur admin directement en base
      adminUser = await createAdminUser()
      
      // Se connecter pour obtenir le token
      const loginResponse = await context.client.post('/login').json({
        email: adminUser.email,
        password: 'password123',
      })
      
      adminToken = loginResponse.body().token
    }
  })

  test('admin can create a contest', async ({ client, assert }) => {
    const response = await client.post('/contests').bearerToken(adminToken).json({
      name: 'Admin Contest',
      description: 'Created by admin',
      start_date: '2025/08/12',
      end_date: '2025/11/12',
      user_id: adminUser.id,
      place_id: 1,
    })

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'name'])
  })
})
```

## Notes

- Le `roleId` par défaut est `1` (utilisateur normal)
- Le `roleId` pour admin est `2` (à vérifier dans votre table `roles`)
- Les utilisateurs créés avec ces helpers ont automatiquement :
  - `birth_date`: 1995-06-28
  - `genderId`: 1
  - Le mot de passe est hashé automatiquement par le modèle
