callBackMaps[slothActions.CHANGE_SLOTH_EXPLORER_PATH] = function (state, action) {
    let activeItem = [];
    const status = [];
    action.index.forEach(function (value, index) {
        if (index === 0) {
            activeItem.push('jobLists[' + value + ']');
        } else {
            activeItem.push(activeItem[index - 1] + '.children[' + value + ']');
        }

        status.push(true);
    });
    activeItem = activeItem.map(function (value) {
        return (value += '.open');
    });
    return _util.dset(state, ['explorerPath'].concat(activeItem), [action.path].concat(status));
};
