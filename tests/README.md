# Tests

Ce projet utilise [Japa](https://japa.dev/) comme framework de tests avec le plugin API Client pour tester les endpoints HTTP.

## Structure des tests

```
tests/
├── functional/          # Tests fonctionnels (API endpoints)
│   ├── auth.spec.ts
│   ├── users.spec.ts
│   ├── posts.spec.ts
│   ├── places.spec.ts
│   ├── contests.spec.ts
│   ├── messages.spec.ts
│   ├── feed.spec.ts
│   └── colors_difficulties.spec.ts
├── helpers/            # Helpers pour les tests
│   ├── create_user.ts
│   └── README.md
└── bootstrap.ts        # Configuration Japa
```

## Prérequis

- Node.js 20+
- PostgreSQL avec extension PostGIS
- Base de données de test configurée

## Configuration

1. Créer un fichier `.env.test` à la racine :

```env
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=votre_clé_générée
NODE_ENV=test

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=boulder_test

SESSION_DRIVER=cookie
BREVO_API_KEY=fake_key_for_tests
```

**Note**: Le fake mailer est automatiquement activé pour tous les tests. Aucun email réel n'est envoyé pendant les tests, même si le code appelle `mail.send()`. La clé Brevo peut être factice.

2. Créer la base de données de test :

```bash
createdb boulder_test
psql -d boulder_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

3. Exécuter les migrations :

```bash
NODE_ENV=test node ace migration:run
```

## Exécuter les tests

### Tous les tests
```bash
npm test
```

### Tests fonctionnels uniquement
```bash
node ace test functional
```

### Tests unitaires uniquement
```bash
node ace test unit
```

### Un fichier de test spécifique
```bash
node ace test --files=tests/functional/auth.spec.ts
```

### Mode watch (développement)
```bash
node ace test --watch
```

## Types de tests

### Tests Fonctionnels (`functional/`)
Tests d'intégration qui testent les endpoints HTTP complets avec la vraie base de données.

## Tests couverts

### Tests Fonctionnels

#### Authentification (`auth.spec.ts`)
- ✅ Inscription utilisateur
- ✅ Connexion
- ✅ Déconnexion
- ✅ Mot de passe oublié
- ✅ Réinitialisation mot de passe

#### Utilisateurs (`users.spec.ts`)
- ✅ Récupérer profil utilisateur
- ✅ Liste des utilisateurs
- ✅ Détail utilisateur
- ✅ Mise à jour profil
- ✅ Suivre un utilisateur
- ✅ Posts d'un utilisateur

#### Posts (`posts.spec.ts`)
- ✅ Créer un post avec images
- ✅ Récupérer un post
- ✅ Mettre à jour un post
- ✅ Supprimer un post
- ✅ Liker/Unliker un post
- ✅ Commentaires (liste, création, suppression)

#### Lieux (`places.spec.ts`)
- ✅ Liste des lieux
- ✅ Détail d'un lieu
- ✅ Zones d'un lieu
- ✅ Voies d'un lieu
- ✅ Favoriser un lieu

#### Concours (`contests.spec.ts`)
- ✅ Créer un concours
- ✅ Liste des concours
- ✅ Détail d'un concours
- ✅ Mise à jour concours
- ✅ Suivre un concours
- ✅ Voies d'un concours
- ✅ Participants
- ✅ Classement
- ✅ Supprimer un concours

#### Messages (`messages.spec.ts`)
- ✅ Créer une conversation
- ✅ Liste des conversations
- ✅ Détail conversation
- ✅ Envoyer un message
- ✅ Marquer comme lu

#### Feed (`feed.spec.ts`)
- ✅ Récupérer le fil d'actualité

#### Référentiels (`colors_difficulties.spec.ts`)
- ✅ Liste des couleurs
- ✅ Liste des difficultés

## CI/CD - GitHub Actions

Les tests s'exécutent automatiquement sur GitHub Actions lors de :
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`

Le workflow :
1. Configure PostgreSQL avec PostGIS
2. Installe les dépendances
3. Crée le fichier `.env.test`
4. Exécute les migrations
5. Lance tous les tests

Voir `.github/workflows/tests.yml` pour la configuration complète.

## Bonnes pratiques

1. **Isolation des tests** : Chaque test doit être indépendant
2. **Données de test** : Utiliser des timestamps pour éviter les conflits (`test-${Date.now()}@example.com`)
3. **Cleanup** : Les tests utilisent des transactions qui sont rollback automatiquement
4. **Assertions** : Utiliser les assertions Japa pour des messages d'erreur clairs

## Debugging

Pour débugger un test :

```bash
node --inspect-brk ace test --files=tests/functional/auth.spec.ts
```

Puis ouvrir Chrome DevTools (`chrome://inspect`).

## Ajouter de nouveaux tests

1. Créer un fichier `*.spec.ts` dans `tests/functional/` ou `tests/unit/`
2. Importer `test` depuis `@japa/runner`
3. Utiliser `test.group()` pour grouper les tests
4. Utiliser `group.setup()` pour l'authentification si nécessaire
5. Écrire les tests avec `test('description', async ({ client, assert }) => { ... })`

Exemple :

```typescript
import { test } from '@japa/runner'

test.group('Ma fonctionnalité', (group) => {
  let authToken: string

  group.setup(async ({ client }) => {
    // Setup commun
  })

  test('devrait faire quelque chose', async ({ client, assert }) => {
    const response = await client.get('/endpoint').bearerToken(authToken)
    response.assertStatus(200)
    assert.isArray(response.body())
  })
})
```
