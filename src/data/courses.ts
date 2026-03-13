/**
 * ============================================
 * DONNÉES DES COURS
 * ============================================
 * 
 * Ce fichier contient TOUS les contenus pédagogiques des 3 niveaux.
 * C'est ici que vous modifiez le texte des cours !
 * 
 * Structure : Un tableau de 3 objets (Débutant, Intermédiaire, Expert)
 * Chaque objet contient plusieurs sections avec leur contenu.
 */

import type { Course } from '@/types';

// ============================================
// TABLEAU DES COURS
// ============================================

/**
 * Tableau contenant les 3 cours complets.
 * Chaque cours a : un niveau, un titre, une description, et des sections
 */
export const courses: Course[] = [
  // ============================================
  // NIVEAU 1 : DÉBUTANT
  // ============================================
  {
    level: 'debutant',
    title: 'Le Moyen-Âge : Les Fondamentaux',
    description: 'Découvrez les bases de cette fascinante période historique qui a duré 1000 ans.',
    estimatedTime: 15,  // 15 minutes de lecture estimée
    
    // Les 5 sections du cours Débutant
    sections: [
      {
        id: 'intro',
        title: 'Qu\'est-ce que le Moyen-Âge ?',
        // Le contenu utilise des backticks (``) pour permettre les sauts de ligne
        content: `Le Moyen-Âge est une période historique qui s'étend du Ve siècle au XVe siècle, soit environ 1000 ans. Elle commence avec la chute de l'Empire romain d'Occident en 476 après J.-C. et se termine avec la prise de Constantinople par les Ottomans en 1453, ou par la découverte de l'Amérique par Christophe Colomb en 1492 selon les historiens.

Cette période est traditionnellement divisée en trois phases :
• Le Haut Moyen-Âge (476-1000) : période des invasions et de la formation des royaumes barbares
• Le Moyen-Âge central (1000-1250) : période de croissance démographique et économique
• Le Bas Moyen-Âge (1250-1450) : période des crises et des transformations

Le terme "Moyen-Âge" a été inventé par les humanistes de la Renaissance qui considéraient cette période comme un "âge sombre" entre l'Antiquité glorieuse et leur propre époque. Aujourd'hui, les historiens considèrent le Moyen-Âge comme une période riche en innovations et en découvertes.`
      },
      {
        id: 'vie-quotidienne',
        title: 'La vie quotidienne au Moyen-Âge',
        content: `La société médiévale était organisée selon un système appelé la féodalité. La grande majorité de la population (environ 90%) vivait dans les campagnes et travaillait la terre.

Les trois ordres de la société :
• Les nobles (ordre des combattants) : ils possédaient des terres et devaient protéger la population
• Les clercs (ordre des priants) : prêtres, moines, religieux qui priaient pour le salut de tous
• Les paysans (ordre des travailleurs) : ils cultivaient la terre et nourrissaient la société

La vie des paysans était très difficile :
• Ils habitaient dans de petites maisons en bois et en torchis
• Ils travaillaient de l'aube au crépuscule, six jours par semaine
• Ils devaient payer des impôts au seigneur et à l'Église (la dîme)
• Leur alimentation se composait principalement de pain, de bouillie et de légumes

Les villes commencent à se développer à partir du XIe siècle, attirant artisans, commerçants et marchands.`
      },
      {
        id: 'chateaux',
        title: 'Les châteaux forts',
        content: `Les châteaux forts sont les symboles du Moyen-Âge féodal. Ils servaient à la fois de résidence aux seigneurs et de lieu de protection pour la population en cas d'attaque.

Évolution des châteaux :
• Premiers châteaux (Xe-XIe siècle) : simples mottes castrales (tertre artificiel surmonté d'une tour en bois)
• Châteaux en pierre (XIIe-XIIIe siècle) : construction massive avec des murs épais, des tours rondes ou carrées, un donjon central
• Châteaux fortifiés avancés (XIVe-XVe siècle) : avec des systèmes de défense complexes comme les bastions, les fossés, les herses

Les parties principales d'un château fort :
• Le donjon : tour centrale, dernière ligne de défense
• Les remparts : murs d'enceinte avec des créneaux
• Le pont-levis : passage mobile sur le fossé
• La basse-cour : espace où vivaient les soldats et les serviteurs
• Le logis seigneurial : résidence du seigneur et de sa famille

Le château était le centre de la vie locale : on y rendait la justice, on y stockait les récoltes, on s'y réfugiait en cas de guerre.`
      },
      {
        id: 'chevaliers',
        title: 'Les chevaliers et la chevalerie',
        content: `Les chevaliers étaient des guerriers montés qui formaient l'élite militaire du Moyen-Âge. Être chevalier était à la fois un statut social et un mode de vie.

Le chemin pour devenir chevalier :
• Page (vers 7-14 ans) : le jeune garçon était envoyé dans un château où il apprenait les bonnes manières, le service, et commençait l'entraînement physique
• Écuyer (14-21 ans) : il s'occupait des chevaux, accompagnait son maître au combat, et s'entraînait sérieusement aux armes
• Adoubement (vers 21 ans) : cérémonie solennelle où l'écuyer devenait chevalier après avoir prouvé sa valeur

L'équipement du chevalier :
• L'épée : arme principale et symbole de son statut
• La lance : utilisée lors des charges à cheval
• La cotte de mailles puis l'armure de plates : protection en métal
• Le bouclier : portait les armoiries de sa famille
• Le destrier : son cheval de guerre, entraîné pour le combat

La chevalerie était aussi un code d'honneur : protéger les faibles, être loyal envers son seigneur, défendre la foi chrétienne, et respecter certaines règles lors des tournois et des batailles.`
      },
      {
        id: 'eglise',
        title: 'L\'Église au Moyen-Âge',
        content: `L'Église catholique jouait un rôle central dans la vie médiévale. Elle était présente dans tous les aspects de la société : religieux, politique, culturel, et éducatif.

Le pouvoir de l'Église :
• Elle possédait environ un tiers des terres en Europe
• Elle percevait la dîme (10% des récoltes de chaque paysan)
• Elle contrôlait l'éducation et les universités
• Elle avait son propre droit (le droit canon) et ses tribunaux

La hiérarchie ecclésiastique :
• Le Pape : chef de l'Église, résidant à Rome
• Les cardinaux : conseillers du Pape, électeurs du nouveau pape
• Les évêques : dirigeants des diocèses
• Les abbés : chefs des monastères
• Les prêtres : desservaient les paroisses
• Les moines : vivaient en communauté dans les monastères

Les monastères étaient des centres importants :
• Ils préservaient les livres et les manuscrits en les copiant
• Ils cultivaient des terres et développaient des techniques agricoles
• Ils accueillaient les voyageurs et les pauvres
• Ils produisaient du vin, de la bière, du fromage

La foi chrétienne structurait le quotidien : les fêtes religieuses rythmaient l'année, les sacrements marquaient les étapes de la vie.`
      }
    ]
  },

  // ============================================
  // NIVEAU 2 : INTERMÉDIAIRE
  // ============================================
  {
    level: 'intermediaire',
    title: 'Le Moyen-Âge : Approfondissements',
    description: 'Explorez les aspects plus complexes de cette période : croisades, commerce, et transformations sociales.',
    estimatedTime: 20,
    sections: [
      {
        id: 'croisades',
        title: 'Les Croisades (1095-1291)',
        content: `Les Croisades furent des expéditions militaires organisées par l'Église chrétienne pour reprendre Jérusalem et les Lieux Saints aux musulmans. Elles marquèrent profondément l'histoire du Moyen-Âge.

Contexte :
• Au XIe siècle, les pèlerins chrétiens rencontraient des difficultés pour se rendre en Terre Sainte
• L'Empire byzantin demandait de l'aide à Rome contre les Seldjoukides
• Le Pape Urbain II lança l'appel à la croisade en 1095 à Clermont

Les principales croisades :
• Première Croisade (1096-1099) : succès des croisés qui s'emparent de Jérusalem
• Deuxième Croisade (1147-1149) : échec de la reconquête d'Edesse
• Troisième Croisade (1189-1192) : après la prise de Jérusalem par Saladin, Richard Cœur de Lion et Philippe Auguste partent en croisade
• Quatrième Croisade (1202-1204) : détournée sur Constantinople, ville pillée par les croisés eux-mêmes

Conséquences des Croisades :
• Ouverture de nouvelles routes commerciales vers l'Orient
• Découverte de produits nouveaux : épices, soie, sucre, café
• Échanges culturels entre l'Europe et le monde musulman
• Développement des villes et du commerce en Europe
• Renforcement du pouvoir des rois
• Progression des connaissances (mathématiques, médecine, philosophie arabes)`
      },
      {
        id: 'commerce',
        title: 'Le commerce et les villes',
        content: `À partir du XIe siècle, l'Europe connaît une renaissance économique. Le commerce se développe, les villes se multiplient et s'enrichissent.

Les foires commerciales :
• Les foires de Champagne (Troyes, Provins, Lagny, Bar-sur-Aube) étaient les plus importantes d'Europe
• Elles attiraient des marchands de toute l'Europe et même du Moyen-Orient
• On y échangeait des tissus, des fourrures, des épices, du sel, des métaux

Les guildes et les corporations :
• Les artisans d'un même métier s'organisaient en corporations
• Chaque métier avait ses règles, ses secrets de fabrication, ses protections
• Pour devenir maître, il fallait passer par les étapes : apprenti, compagnon, puis maître

Les routes commerciales :
• La route de la soie reliait la Chine à l'Europe
• Les républiques maritimes (Venise, Gênes, Pise) contrôlaient le commerce méditerranéen
• Les villes de la Hanse (Ligue commerciale du Nord) dominaient le commerce de la Baltique

Innovations économiques :
• L'usage de la monnaie se généralise
• Apparition des lettres de change et des banques
• Création des premières compagnies commerciales
• Développement du crédit et de l'assurance maritime`
      },
      {
        id: 'universites',
        title: 'Les universités et le savoir',
        content: `Les universités naissent au XIIe siècle en Europe. Ce sont des lieux où les savoirs de l'Antiquité sont préservés, étudiés et enrichis.

Les premières universités :
• Bologne (1088) : spécialisée en droit
• Paris (1150) : spécialisée en théologie
• Oxford (1167) : modèle des universités anglaises
• Salerne : célèbre pour son école de médecine

Organisation des études :
• Les universités étaient divisées en facultés : arts (lettres), droit, médecine, théologie
• Le cursus durait plusieurs années
• Les professeurs donnaient des cours magistraux (leçons)
• Les étudiants participaient à des disputations (débats)

Les manuscrits et les bibliothèques :
• Les livres étaient copiés à la main par des moines copistes
• Les abbayes et les cathédrales possédaient des scriptoriums (ateliers de copie)
• Les enluminures décoraient les manuscrits précieux
• Les bibliothèques préservaient les œuvres des auteurs antiques et médiévaux

La Scolastique :
• Méthode d'étude basée sur la dialectique et la logique
• Thomas d'Aquin est son plus grand représentant
• Elle cherchait à concilier la foi et la raison
• L'œuvre majeure : la Somme théologique`
      },
      {
        id: 'pestenoire',
        title: 'La Peste Noire (1347-1353)',
        content: `La Peste Noire est l'une des pandémies les plus dévastatrices de l'histoire humaine. Elle a tué environ un tiers de la population européenne.

Origine et propagation :
• La peste est apparue en Asie centrale
• Elle s'est propagée par les routes commerciales, notamment la route de la soie
• Elle est arrivée en Europe en 1347 par les ports de Sicile et de Gênes
• En quelques années, elle touche toute l'Europe

Symptômes et formes :
• La peste bubonique : ganglions enflés (bubons), fièvre, mort en 3-5 jours
• La peste pulmonaire : infection des poumons, très contagieuse, mort en 2-3 jours
• La peste septicémique : infection du sang, mort en quelques heures

Conséquences démographiques et sociales :
• Entre 25 et 50 millions de morts en Europe (30-60% de la population)
• Pénurie de main-d'œuvre dans les campagnes
• Augmentation des salaires pour attirer les travailleurs
• Révoltes paysannes (Jacquerie en France, révolte des Wat Tyler en Angleterre)
• Persécutions des Juifs, accusés d'empoisonner les puits

Conséquences économiques et culturelles :
• Effondrement du commerce international
• Crise agricole : terres abandonnées, prix des produits agricoles qui montent
• Remise en question de l'autorité de l'Église (pourquoi Dieu permet-il cela ?)
• Développement de l'art macabre (danse macabre, memento mori)`
      },
      {
        id: 'guerre-centans',
        title: 'La Guerre de Cent Ans (1337-1453)',
        content: `La Guerre de Cent Ans oppose le royaume de France au royaume d'Angleterre pendant plus d'un siècle. Elle transforme profondément les deux pays.

Origines du conflit :
• Conflit dynastique : les rois d'Angleterre revendiquent le trône de France
• Conflit territorial : possession de la Guyenne et de la Flandre
• Conflit commercial : contrôle du commerce de la laine flamande

Les grandes phases :
• Phase anglaise (1337-1360) : victoires anglaises à Crécy (1346) et Poitiers (1356)
• Phase française (1369-1380) : reconquête menée par Du Guesclin
• Phase de crise (1380-1415) : guerre civile en France entre Armagnacs et Bourguignons
• Phase anglaise (1415-1420) : victoire d'Azincourt (1415), traité de Troyes
• Phase finale (1429-1453) : Jeanne d'Arc libère Orléans, les Français reprennent presque tout

Les innovations militaires :
• L'arc long anglais : arme redoutable à longue portée
• L'artillerie : canons utilisés dès le siège d'Orléans
• Les armées permanentes : fin des armées féodales

Les personnages marquants :
• Édouard III et le Prince Noir (Angleterre)
• Philippe VI, Jean II, Charles V, Charles VII (France)
• Jeanne d'Arc : héroïne nationale, brûlée vive à Rouen en 1431
• Bertrand Du Guesclin : connétable de France

Conséquences :
• Renforcement du pouvoir royal en France
• Développement du sentiment national
• L'Angleterre perd presque tous ses territoires en France`
      }
    ]
  },

  // ============================================
  // NIVEAU 3 : EXPERT
  // ============================================
  {
    level: 'expert',
    title: 'Le Moyen-Âge : Maîtrise Historique',
    description: 'Analysez les structures politiques, intellectuelles et artistiques de la fin du Moyen-Âge.',
    estimatedTime: 25,
    sections: [
      {
        id: 'renaissance-urbaine',
        title: 'La renaissance urbaine du XIIe siècle',
        content: `Le XIIe siècle marque un tournant majeur dans l'histoire médiévale avec la renaissance urbaine. Les villes, qui avaient décliné après la chute de l'Empire romain, connaissent une expansion spectaculaire.

Facteurs de la croissance urbaine :
• La révolution agricole du Haut Moyen-Âge (nouvelles terres, nouvelles techniques)
• Excédent alimentaire permettant de nourrir des populations non agricoles
• Croissance démographique importante
• Développement du commerce à longue distance
• Amélioration de la sécurité (fin des grandes invasions)

Les nouvelles villes :
• Les bourgs : villages qui se sont développés grâce à un château, un monastère, ou une position commerciale favorable
• Les villes neuves : fondées par des seigneurs ou des rois pour attirer population et commerce
• Les communes : villes qui obtiennent des chartes de liberté et s'autogèrent

La lutte pour les libertés communales :
• Les habitants des villes (bourgeois) réclament des privilèges : exemption du servage, droit de s'assembler, droit de justice
• Luttes parfois violentes contre les seigneurs (Laon, 1111)
• Les chartes communales reconnaissent ces libertés en échange de paiements

Organisation des villes :
• Les quartiers d'artisans regroupés par métier
• La place du marché, centre économique et social
• L'hôtel de ville, siège du pouvoir municipal
• Les églises et les cathédrales, symboles de la foi et de la puissance
• Les remparts, nécessaires pour la protection

La bourgeoisie :
• Classe sociale nouvelle, ni noble ni paysan
• Composée de marchands, d'artisans, de banquiers
• Riche et influente, elle prête de l'argent aux rois et aux seigneurs
• Elle réclame progressivement une participation au pouvoir politique`
      },
      {
        id: 'gothique',
        title: 'L\'art gothique : cathédrales et création',
        content: `L'art gothique naît au XIIe siècle en France et se diffuse ensuite dans toute l'Europe. Il représente l'une des plus grandes réalisations artistiques du Moyen-Âge.

Les innovations architecturales :
• L'arc brisé (ou ogival) : permet de répartir mieux les poids
• La voûte sur croisée d'ogives : plus légère et plus stable que la voûte romane
• L'arc-boutant : contrefort extérieur qui soutient les murs et permet de percer des fenêtres
• Les murs deviennent des "squelettes de pierre" avec de grandes ouvertures vitrées

Les étapes du style gothique :
• Gothique primitif (1140-1200) : Saint-Denis, Notre-Dame de Paris
• Gothique classique (1200-1280) : Chartres, Reims, Amiens
• Gothique rayonnant (1280-1380) : Sainte-Chapelle de Paris
• Gothique flamboyant (1380-1500) : façades très décorées, motifs en flammes

La sculpture gothique :
• Plus naturelle et expressive que la sculpture romane
• Portails des cathédrales couverts de statues (ébrasements, tympans, voussures)
• Les statues-colonnes représentent des personnages bibliques
• Les gargouilles et les chimères ornent les extérieurs

La peinture et l'enluminure :
• Les vitraux : "bibles pour les illettrés", racontent des histoires bibliques
• Les enluminures des manuscrits deviennent de plus en plus sophistiquées
• Les primitifs flamands (Van Eyck) annoncent la Renaissance

La musique :
• L'école de Notre-Dame de Paris : invention de la polyphonie (plusieurs voix simultanées)
• Guillaume de Machaut : poète et compositeur du XIVe siècle
• L'ars nova : nouveau style musical plus complexe et expressif`
      },
      {
        id: 'etats-modernes',
        title: 'La naissance des États modernes',
        content: `À la fin du Moyen-Âge, les royaumes européens se transforment progressivement en États modernes, centralisés et bureaucratisés.

La consolidation du pouvoir royal en France :
• Philippe Auguste (1180-1223) : annexion de la Normandie, de l'Anjou, de la Touraine aux Plantagenêts
• Louis IX (Saint Louis, 1226-1270) : réforme de la justice, création du Parlement de Paris
• Philippe IV le Bel (1285-1314) : affrontement avec la papauté, création des États généraux
• Les rois s'appuient sur des fonctionnaires (baillis, sénéchaux) pour administrer le royaume

L'Angleterre :
• Jean sans Terre (1199-1216) : signature de la Magna Carta (1215), limitation du pouvoir royal
• Édouard Ier (1272-1307) : création du Parlement, modèle du parlementarisme
• Développement du Common Law (droit coutumier unifié)

Les États italiens :
• L'Italie reste divisée en multiples États : royaume de Naples, États pontificaux, républiques de Florence et de Venise, duché de Milan...
• Les républiques urbaines sont gouvernées par des oligarchies marchandes
• Apparition des condottieres (chefs de mercenaires) et des seigneurs (Signori)

Les États allemands :
• Le Saint Empire romain germanique reste une confédération de princes
• L'empereur est élu par les princes-électeurs
• Faiblesse du pouvoir central au profit des princes territoriaux (Brandebourg, Bavière, Saxe...)

Les caractéristiques de l'État moderne :
• Territoire défini par des frontières
• Population soumise à une même autorité politique
• Administration centralisée avec des fonctionnaires
• Armée permanente et professionnelle
• Impôts levés régulièrement
• Justice unifiée`
      },
      {
        id: 'crise-14e',
        title: 'Les crises du XIVe siècle',
        content: `Le XIVe siècle est une période de crises multiples qui marquent profondément la fin du Moyen-Âge et préparent les transformations de la Renaissance.

La crise démographique :
• La Peste Noire (1347-1353) : perte de 30 à 60% de la population européenne
• Retour régulier de la peste tout au long du siècle
• Déclin de la population urbaine et rurale
• Pénurie de main-d'œuvre et hausse des salaires

La crise économique :
• Dépression du commerce international
• Crise agricole : terres abandonnées, baisse des prix agricoles
• Crise monétaire : dévaluation des monnaies, difficultés financières des États
• Faillite des grandes banques italiennes (Bardi, Peruzzi)

La crise politique :
• Guerre de Cent Ans entre la France et l'Angleterre
• Grand Schisme d'Occident (1378-1417) : deux papes, puis trois, se disputent le pouvoir
• Révoltes populaires : Jacquerie en France (1358), révolte des Ciompi à Florence (1378), révolte des Wat Tyler en Angleterre (1381)
• Guerres civiles dans de nombreux États

La crise spirituelle :
• Remise en question de l'autorité de l'Église
• Développement de mouvements hérétiques (Wyclif, Huss)
• Mysticisme et dévotion personnelle
• Apparition de nouvelles congrégations religieuses

Les conséquences :
• Affaiblissement du système féodal
• Renforcement du pouvoir des États (impôts, armées)
• Transformation des mentalités (peur de la mort, recherche du plaisir)
• Préparation des esprits aux réformes religieuses du XVIe siècle`
      },
      {
        id: 'fin-moyen-age',
        title: 'La fin du Moyen-Âge et la Renaissance',
        content: `La fin du XVe siècle marque la transition entre le Moyen-Âge et la Renaissance. Les changements sont progressifs et touchent tous les domaines de la société.

Les transformations politiques :
• Les rois affirment leur pouvoir absolu (Louis XI en France, Ferdinand et Isabelle en Espagne, Henri VII en Angleterre)
• Unification des grands États européens
• Développement de la diplomatie et des ambassades permanentes
• Premiers pas vers l'Europe des nations

Les découvertes géographiques :
• 1492 : Christophe Colomb découvre l'Amérique
• 1498 : Vasco de Gama atteint les Indes par le cap de Bonne-Espérance
• 1519-1522 : Magellan fait le tour du monde
• Ces découvertes bouleversent la vision du monde et ouvrent de nouvelles routes commerciales

Les transformations économiques :
• L'or d'Amérique arrive en Europe et provoque l'inflation
• Déplacement du centre économique européen de la Méditerranée vers l'Atlantique
• Développement du capitalisme commercial
• Premières formes de colonialisme

Les transformations culturelles :
• L'humanisme : retour aux sources antiques, valorisation de l'individu
• L'imprimerie (Gutenberg, vers 1450) : révolution dans la diffusion du savoir
• Les arts : perspective, anatomie, naturalisme
• La science : remise en question des autorités antiques (Copernic, Galilée)

La fin du monde médiéval :
• La chute de Constantinople aux mains des Ottomans (1453)
• La fin de la Guerre de Cent Ans (1453)
• L'invention de l'imprimerie (vers 1450)
• La découverte de l'Amérique (1492)

Ces événements marquent traditionnellement la fin du Moyen-Âge et le début des Temps modernes, bien que ces frontières soient artificielles et que beaucoup d'éléments médiévaux persistent encore longtemps.`
      }
    ]
  }
];
