# Portfolio Astro - Mise en Place et Déploiement

Ce document résume les étapes suivies pour la création, la configuration et le déploiement de ce portfolio sur GitLab Pages.

## 1. Création de la page Astro

Nous avons commencé par exécuter la commande suivante pour lancer l'assistant de création de projet Astro :

```bash
npm create astro@latest
```

Nous avons répondu aux questions de l'assistant, notamment pour choisir l'emplacement du dossier du portfolio :

```bash
cd /Users/tom/Deploiement_de_services_S3/portfolio
```

Pour lancer le serveur de développement local :

```bash
npm run dev
```

Le site est alors accessible via l'URL : http://localhost:4321/

---

## 2. Synchronisation sur GitLab

Après avoir configuré le projet localement, nous l'avons synchronisé sur GitLab.

1.  Création d'un projet vide sur GitLab.
2.  Configuration de l'identité Git :

```bash
git config --global user.name "Tom Marcheron"
git config --global user.email "tom.marcheron@etu.unicaen.fr"
```

3.  Initialisation et envoi vers le dépôt distant :

```bash
git init --initial-branch=main --object-format=sha1
git remote add origin https://git.unicaen.fr/marcher241/portfolio2.git
git add .
git commit -m "Initial commit"
git push --set-upstream origin main
```

Le projet est maintenant synchronisé sur GitLab.

---

## 3. Configuration CI/CD (.gitlab-ci.yml)

Pour déployer le site sur GitLab Pages, nous avons créé le fichier `.gitlab-ci.yml` à la racine du projet :

```yaml
image: node:lts

pages:
  stage: deploy
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - public
  only:
    - main
    - master
```

---

## 4. Modification de astro.config.mjs

Nous avons ajusté la configuration d'Astro pour qu'elle corresponde aux attentes de GitLab Pages (dossier de sortie `public`).

Fichier `astro.config.mjs` :

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://portfolio2-417da1.pages.unicaen.fr/",
	base: "/",
	outDir: "public",
	publicDir: "static",
});
```

Cette configuration force Astro à générer le site dans le dossier `public`, ce qui est requis par le job GitLab Pages configuré ci-dessus.

---

## 5. Résultat Final

Une fois le pipeline synchronisé et exécuté avec succès, le site est accessible à l'adresse suivante :

**https://portfolio2-417da1.pages.unicaen.fr/**