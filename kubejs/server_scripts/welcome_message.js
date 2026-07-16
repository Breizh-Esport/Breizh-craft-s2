// Une entree = une ligne de chat. Utiliser Text.* pour la couleur / le style :
//   Text.gold('...'), Text.gray('...'), Text.green('...').bold(true),
//   Text.of('a').append(Text.aqua('b')), Text.translate('cle.de.lang')
const WELCOME_LINES = [
  Text.of('Bievenue sur ').bold(true)
    .append(Text.orange("Breizh Craft").bold(true))
    .append(Text.of(' !').bold(true)),
  Text.warn('Informations :'),
  Text.of('- Si vous avez des difficultés pour accéder aux chunks claim par vos amis, merci de contacter un administrateur.'),
  Text.of("- Un bug affecte actuellement les portails d'iron spell utilisés à proximité de véhicule create aeronautics. A utiliser avec précaution, au risque de perdre vos créations."),
  Text.of(""),
  Text.of("Bon jeu à toi !").bold(true)
  ]

// Delai avant l'affichage (en ticks, 20 ticks = 1s) : laisse le temps au client
// de finir de charger avant que le message n'arrive dans le chat.
const WELCOME_DELAY_TICKS = 40

PlayerEvents.loggedIn(event => {
    const player = event.player

    event.server.scheduleInTicks(WELCOME_DELAY_TICKS, () => {
        // Le joueur peut s'etre deconnecte entre-temps.
        if (player.removed) return

        WELCOME_LINES.forEach(line => player.tell(line))
    })
})
