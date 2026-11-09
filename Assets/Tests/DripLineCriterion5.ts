import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {criterion5} from './DripLineChecks';
@component
export class DripLineCriterion5 extends Scenario { async run():Promise<void>{await criterion5();} }
