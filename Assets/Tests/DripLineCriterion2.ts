import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {criterion2} from './DripLineChecks';
@component
export class DripLineCriterion2 extends Scenario { async run():Promise<void>{await criterion2();} }
