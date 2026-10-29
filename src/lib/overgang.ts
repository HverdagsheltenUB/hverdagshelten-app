import { router, type Href } from 'expo-router';
import { Keyframe } from 'react-native-reanimated';

import { animasjon } from './tema';

// Hvilken vei neste skjerm skal gli inn fra.
// 'frem' = fra høyre, 'tilbake' = fra venstre, 'rolle' = skalerer opp fra 98 %.
export type Retning = 'frem' | 'tilbake' | 'rolle';

// Retningen settes rett før vi navigerer, og leses når den nye skjermen tegnes.
// Den ligger utenfor React fordi den bare skal gjelde for neste overgang.
let nesteRetning: Retning = 'frem';

export function settRetning(retning: Retning) {
  nesteRetning = retning;
}

export function hentRetning() {
  return nesteRetning;
}

export function gaFrem(href: Href) {
  settRetning('frem');
  router.push(href);
}

// Bytter fane fra en lenke på skjermen. Lenkene peker alltid mot en fane lenger til høyre.
export function gaTilFane(href: '/avtaler' | '/kart' | '/profil') {
  settRetning('frem');
  router.navigate(href);
}

export function gaTilbake(reserve: Href = '/') {
  settRetning('tilbake');
  if (router.canGoBack()) router.back();
  else router.replace(reserve);
}

export function skjermInn(retning: Retning, redusertBevegelse: boolean) {
  if (retning === 'rolle') {
    return new Keyframe({
      0: { opacity: 0, transform: [{ scale: redusertBevegelse ? 1 : 0.98 }] },
      100: { opacity: 1, transform: [{ scale: 1 }], easing: animasjon.easing },
    }).duration(animasjon.rollebytte);
  }
  const fra = redusertBevegelse ? 0 : animasjon.forskyvning * (retning === 'frem' ? 1 : -1);
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateX: fra }] },
    100: { opacity: 1, transform: [{ translateX: 0 }], easing: animasjon.easing },
  }).duration(animasjon.skjerm);
}

// Hvert element på skjermen toner inn og løfter seg litt, ett etter ett.
export function elementInn(nummer: number, redusertBevegelse: boolean) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: redusertBevegelse ? 0 : 8 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: animasjon.easing },
  })
    .duration(animasjon.skjerm)
    .delay(Math.min(nummer * animasjon.innholdSteg, animasjon.innholdMaks));
}
