import { cSay } from './c';
import { bSay } from './b';

bSay();
cSay();

export const say = () => console.log('A say');

export default { say };
