import { Rails } from './motifs';
import {
  TopBar,
  Hero,
  CounterStrip,
  SignalChain,
  Catalog,
  LastNight,
  Patches,
  Manifesto,
  Footer,
} from './sections';

export default function App() {
  return (
    <>
      <Rails left="system" right="rope-anim" enabled={true} />

      <TopBar />
      <Hero icon="amex" />
      <CounterStrip />
      <SignalChain />
      <Catalog />
      <LastNight />
      <Patches />
      <Manifesto />
      <Footer />
    </>
  );
}
