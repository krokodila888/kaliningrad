import { loadData } from '../src/build/adventData';

try {
  const cells = loadData(process.cwd());
  console.log(`Данные в порядке: ячеек — ${cells.length}.`);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
