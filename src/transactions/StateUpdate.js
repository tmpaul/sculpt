/**
 *
 * @memberOf Transactions
 * 
 */
class Transaction {
  /**
   * Class constructor
   *
   * <br>
   * This class is responsible for batching a series of mutations and then
   * performing the actual state update on the root state tree. There are
   * several reasons for this:
   *
   * <pre>
   *
   * 1) Performance: It is very costly to continuously modify and generate immutable
   * state during drawing/moving/scaling events etc. It is better to batch these
   * mutations together. ImmutableJS does something very similar with the method 
   * <span style="background:lightyellow">.withMutations</span>
   *
   * 2) Undo: Since the mutations are grouped, it is extremely easy to abort the
   * sequence of mutations.
   *
   * 3) Grouping: The sequence of mutations play very well with the output of event handlers
   * such as DrawEventHandler.
   * </pre>
   *
   * @param  {Object} initialState The initial state before transaction is run
   */
  constructor(initialState) {
    this.initialState = initialState;
    this._mutationsQueue = [];
  }

  /**
   * Add the given list of mutations to mutations queue
   * @param {Array} mutations [description]
   */
  addMutations(mutations) {
    this._mutationsQueue = this._mutationsQueue.concat(mutations);
  }

  /**
   * Run the mutations on initialState in order and return updated state
   * @return {Object} Updated state
   */
  runMutations() {
    
  }
}

export default Transaction;
