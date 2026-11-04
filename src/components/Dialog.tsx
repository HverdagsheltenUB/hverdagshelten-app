import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { farger } from '../lib/tema';
import { Knapp } from './Knapp';
import { Tekst } from './Tekst';

type Valg = {
  tittel: string;
  tekst?: string;
  ja: string;
  nei?: string;
  // Rød knapp, for det som ikke kan angres (avlyse, slette).
  farlig?: boolean;
};

type Apen = Valg & { svar: (ja: boolean) => void };

const DialogContext = createContext<((valg: Valg) => Promise<boolean>) | null>(null);

// «Er du sikker?» før alt som er viktig. Egen boks i stedet for Alert,
// fordi Alert ikke virker på web og har for liten tekst for mange eldre.
export function DialogProvider({ children }: { children: ReactNode }) {
  const [apen, setApen] = useState<Apen | null>(null);
  const venter = useRef<((ja: boolean) => void) | null>(null);

  const bekreft = useCallback(
    (valg: Valg) =>
      new Promise<boolean>((resolve) => {
        venter.current = resolve;
        setApen({ ...valg, svar: resolve });
      }),
    [],
  );

  function svar(ja: boolean) {
    venter.current?.(ja);
    venter.current = null;
    setApen(null);
  }

  return (
    <DialogContext.Provider value={bekreft}>
      {children}
      <Modal visible={apen !== null} transparent animationType="fade" onRequestClose={() => svar(false)}>
        <Pressable style={styles.bakgrunn} onPress={() => svar(false)} accessibilityLabel="Lukk">
          <Pressable style={styles.boks} onPress={() => {}} accessibilityViewIsModal>
            {apen && (
              <>
                <Tekst variant="mellomtittel" accessibilityRole="header">
                  {apen.tittel}
                </Tekst>
                {apen.tekst && <Tekst variant="brod">{apen.tekst}</Tekst>}
                <View style={styles.knapper}>
                  <Knapp tekst={apen.ja} variant={apen.farlig ? 'rod' : 'hoved'} onPress={() => svar(true)} />
                  <Knapp tekst={apen.nei ?? 'Nei, gå tilbake'} variant="sekundar" onPress={() => svar(false)} />
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useBekreft() {
  const verdi = useContext(DialogContext);
  if (!verdi) throw new Error('useBekreft må brukes inni DialogProvider');
  return verdi;
}

const styles = StyleSheet.create({
  bakgrunn: {
    flex: 1,
    backgroundColor: 'rgba(43,34,48,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  boks: {
    backgroundColor: farger.krem,
    borderRadius: 22,
    padding: 22,
    gap: 14,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  knapper: {
    gap: 10,
    marginTop: 6,
  },
});
