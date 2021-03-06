import boardsRepository from "./../../repositories/boardsRepository";
import itemsRepository from "./../../repositories/itemsRepository";
import EmojiIcons from "./../../assets/emojiIcons";
import syncRepository from "../../repositories/syncRepository";

const state = {
  activeBoard: {},
  addItemEmoji: {
    search: "",
    icons: EmojiIcons,
    activeIndex: 0
  },
  boardItems: [],
  boardsList: [],
  findItem: {
    itemText: ""
  },
  isSubmittingNewItem: false,
  rawBoards: []
};

const mutations = {
  SET_ACTIVE_BOARD(state, board) {
    const activeBoard = state.boardsList.find((b) => b.id === board.id);
    state.activeBoard = activeBoard;
  },
  SET_BOARD_ITEMS(state, items) {
    state.boardItems = items;
  },
  SET_BOARDS(state, boardsArray) {
    state.boardsList = boardsArray;
  },
  SET_FIND_ITEM_TEXT(state, val) {
    state.findItem.itemText = val;
  },
  SET_IS_SUBMITTING_NEW_ITEM(state, val) {
    state.isSubmittingNewItem = val;
  },
  SET_RAW_BOARDS(state, boards) {
    state.rawBoards = boards;
  },
  SWITCH_PREPEND_NEW_ITEM(state, {prependNewItem}) {
    state.activeBoard.prependNewItem = prependNewItem;
  },
  SWITCH_SHOW_DONE(state, {showDone}) {
    state.activeBoard.showDone = showDone;
  },
  SWITCH_SHOW_PROGRESS(state, val) {
    state.activeBoard.showProgress = val;
  }
};

const actions = {
  addItem({state, rootState}, {boardId, newItem}) {
    const activeBoard = state.boardsList.find((board) => board.id === boardId);
    if (activeBoard.prependNewItem === true) {
      const res = boardsRepository.addItemToBegin(boardId, newItem);
      syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
      return res;
    } else {
      const res = boardsRepository.addItemToEnd(boardId, newItem);
      syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
      return res;
    }
  },
  changeBoardsOrder({rootState}, moved) {
    boardsRepository.changeBoardsOrder(moved);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  changeFindItem({commit}, val) {
    commit("SET_FIND_ITEM_TEXT", val);
  },
  changeIsDone({rootState}, {boardId, itemId, newVal}) {
    itemsRepository.switchIsDone(boardId, itemId, newVal);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  changeItemVal({rootState}, {boardId, itemId, newVal}) {
    itemsRepository.changeItemValue(boardId, itemId, newVal);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  fetchActiveBoard({commit}) {
    const board = boardsRepository.getBoardById(boardsRepository.getActiveBoard());
    commit("SET_ACTIVE_BOARD", board);
  },
  fetchBoardItems({commit}, boardId) {
    commit("SET_BOARD_ITEMS", boardsRepository.getBoardItems(boardId));
  },
  fetchBoards({commit}) {
    commit("SET_BOARDS", boardsRepository.getList());
  },
  fetchRawBoards({commit}) {
    commit("SET_RAW_BOARDS", boardsRepository.getRawBoards());
  },
  itemsOrderChanged({rootState}, {moved, boardId}) {
    boardsRepository.changeItemsOrder(boardId, moved);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  moveItemToBoard({commit, rootState}, {srcBoardId, dstBoardId, itemId}) {
    boardsRepository.moveItemToBoard(srcBoardId, dstBoardId, itemId);
    actions.fetchBoards({commit});
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  moveItemToBottom({rootState}, {boardId, itemId}) {
    boardsRepository.moveItemToBottom(boardId, itemId);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  moveItemToTop({rootState}, {boardId, itemId}) {
    boardsRepository.moveItemToTop(boardId, itemId);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  removeBoard({rootState}, boardId) {
    boardsRepository.removeBoard(boardId);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  removeItem({commit, rootState}, {boardId, itemId}) {
    itemsRepository.removeItem(boardId, itemId);
    actions.fetchBoards({commit});
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  renameBoard({rootState}, {boardId, newName}) {
    boardsRepository.renameBoard(boardId, newName);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  saveNewBoard({commit, rootState}, boardName) {
    const savedBoard = boardsRepository.addNewBoard(boardName, rootState.settings);
    actions.fetchBoards({commit});
    commit("SET_ACTIVE_BOARD", savedBoard);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
    return savedBoard.id;
  },
  setActiveBoard({commit}, boardId) {
    boardsRepository.setActiveBoard(boardId);
    const board = boardsRepository.getBoardById(boardId);
    commit("SET_ACTIVE_BOARD", board);
  },
  setFirstBoardAsActiveBoard({commit}) {
    const activeBoard = boardsRepository.getFirstBoard();
    boardsRepository.setActiveBoard(activeBoard.id);
    commit("SET_ACTIVE_BOARD", activeBoard);
    return activeBoard.id;
  },
  setIsSubmittingNewItem({commit}, val) {
    commit("SET_IS_SUBMITTING_NEW_ITEM", val);
  },
  switchPrependNewItem({commit, rootState}, {boardId, prependNewItem}) {
    itemsRepository.switchPrependNewItem(boardId, prependNewItem);
    commit("SWITCH_PREPEND_NEW_ITEM", {boardId, prependNewItem});
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  switchShowDone({commit, rootState}, {boardId, showDone}) {
    boardsRepository.switchShowDone(boardId, showDone);
    commit("SWITCH_SHOW_DONE", {boardId, showDone});
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  switchShowProgress({commit, rootState}, {boardId, val}) {
    itemsRepository.switchShowProgress(boardId, val);
    commit("SWITCH_SHOW_PROGRESS", val);
    syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token);
  },
  syncBoardsDone({dispatch}, boards) {
    boardsRepository.saveBoardsArray(boards);
    dispatch("fetchBoards");
    dispatch("fetchRawBoards");
  },
  syncGetBoards({dispatch, rootState}, {username, rawBoards, token}){
    syncRepository.getBoards(username, rawBoards, token)
      .then(({data})=>{
        boardsRepository.saveBoardsArray(data, true);
        dispatch("fetchBoards");
        dispatch("fetchRawBoards");
        dispatch("fetchBoardItems", rootState.boards.activeBoard.id);
        syncRepository.tryConsumeQueue(rootState.settings.username, rootState.settings.token)
      })
  }
};

export default {
  state,
  mutations,
  actions
};
