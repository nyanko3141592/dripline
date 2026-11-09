import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {criterion3} from './DripLineChecks';
@component
export class DripLineCriterion3 extends Scenario { async run():Promise<void>{await criterion3();} }
