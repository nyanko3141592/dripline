import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {criterion1} from './DripLineChecks';
@component
export class DripLineCriterion1 extends Scenario { async run():Promise<void>{await criterion1();} }
