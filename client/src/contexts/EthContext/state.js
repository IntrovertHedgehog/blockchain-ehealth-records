const actions = {
  init: "INIT"
};

const initialState = {
  artifacts: [],
  web3: null,
  accounts: null,
  networkID: null,
  contracts: []
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data, artifacts: [...state.artifacts, data.artifacts], contracts: [...state.contracts, data.contracts] };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
