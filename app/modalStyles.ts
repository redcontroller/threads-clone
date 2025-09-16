import { StyleSheet } from 'react-native';

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerLight: {
    backgroundColor: 'white',
  },
  containerDark: {
    backgroundColor: '#101010',
  },
  headerLight: {
    backgroundColor: 'white',
  },
  headerDark: {
    backgroundColor: '#101010',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  titleLight: {
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  headerRightPlaceholder: {
    width: 60,
  },
  cancel: {
    fontSize: 16,
  },
  disabledText: {
    color: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelLight: {
    color: '#000',
  },
  cancelDark: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listLight: {
    backgroundColor: '#eee',
  },
  listDark: {
    backgroundColor: '#101010',
  },
  threadContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  threadContainerLight: {
    backgroundColor: 'transparent',
  },
  threadContainerDark: {
    backgroundColor: '#101010',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#555',
  },
  avatarLight: {
    backgroundColor: '#555',
  },
  avatarDark: {
    backgroundColor: '#555',
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#555',
  },
  avatarSmallLight: {
    backgroundColor: '#555',
  },
  avatarSmallDark: {
    backgroundColor: '#555',
  },
  threadLine: {
    width: 1.5,
    flexGrow: 1,
    backgroundColor: '#aaa',
    marginTop: 8,
  },
  threadLineLight: {
    backgroundColor: '#aaa',
  },
  threadLineDark: {
    backgroundColor: '#aaa',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 6,
    position: 'relative',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
    color: '#000',
  },
  usernameLight: {
    color: '#000',
  },
  usernameDark: {
    color: '#fff',
  },
  input: {
    fontSize: 15,
    paddingTop: 4,
    paddingBottom: 8,
    minHeight: 24,
    lineHeight: 20,
  },
  inputLight: {
    color: '#000',
  },
  inputDark: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 15,
  },
  imageFlatList: {
    marginTop: 12,
    marginBottom: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerLight: {
    backgroundColor: '#fff',
  },
  footerDark: {
    backgroundColor: '#101010',
  },
  footerText: {
    fontSize: 14,
  },
  footerTextLight: {
    color: '#8e8e93',
  },
  footerTextDark: {
    color: '#fff',
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  postButtonLight: {
    backgroundColor: '#000',
  },
  postButtonDark: {
    backgroundColor: '#fff',
  },
  postButtonDisabledDark: {
    backgroundColor: '#555',
  },
  postButtonDisabledLight: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  postButtonTextLight: {
    color: '#fff',
  },
  postButtonTextDark: {
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  dropdownContainerLight: {
    backgroundColor: '#fff',
  },
  dropdownContainerDark: {
    backgroundColor: '#101010',
  },
  dropdownOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  selectedOption: {},
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownOptionTextLight: {
    color: '#000',
  },
  dropdownOptionTextDark: {
    color: '#fff',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  selectedOptionTextLight: {
    color: '#007AFF',
  },
  selectedOptionTextDark: {
    color: '#007AFF',
  },
  removeButton: {
    padding: 4,
    marginRight: -4,
    marginLeft: 8,
  },
  listFooter: {
    paddingLeft: 26,
    paddingTop: 10,
    flexDirection: 'row',
  },
  listFooterAvatar: {
    marginRight: 20,
    paddingTop: 2,
  },
  locationContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  topicInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#000',
  },
  topicPlaceholder: {
    fontWeight: 400,
  },
  hiddenPlaceholder: {
    opacity: 0,
  },
  chevronIcon: {
    marginHorizontal: 2,
    alignSelf: 'center',
  },
  topicInputSection: {
    marginBottom: 8,
  },
  topicTextInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
  },
  topicTextInputLight: {
    backgroundColor: '#fff',
  },
  topicTextInputDark: {
    backgroundColor: '#101010',
  },
  topicOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 1,
    minHeight: 44,
    gap: 2,
  },
  topicOptionLight: {
    backgroundColor: '#fff',
  },
  topicOptionDark: {
    backgroundColor: '#101010',
  },
  topicOptionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  topicOptionTextLight: {
    color: '#999',
  },
  topicOptionTextDark: {
    color: '#fff',
  },
  newTopicText: {
    fontSize: 13,
  },
  newTopicTextLight: {
    color: '#000',
  },
  newTopicTextDark: {
    color: '#fff',
  },
  topicSelectionOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  topicSelectionContent: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topicSelectionContentLight: {
    backgroundColor: '#fff',
  },
  topicSelectionContentDark: {
    backgroundColor: '#101010',
  },
  topicOptionsList: {
    maxHeight: 150,
    marginTop: 8,
    flexGrow: 0,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContainerLight: {
    backgroundColor: '#fff',
  },
  bottomSheetContainerDark: {
    backgroundColor: '#101010',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomSheetHeaderLight: {
    backgroundColor: '#fff',
  },
  bottomSheetHeaderDark: {
    backgroundColor: '#101010',
  },
  bottomSheetHeaderLine: {
    width: 40,
    height: 2,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
  },
  searchContainerLight: {
    backgroundColor: '#f1f1f1',
  },
  searchContainerDark: {
    backgroundColor: 'black',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchInputLight: {
    color: '#f5f5f5',
  },
  searchInputDark: {
    color: 'black',
  },
  removeSearchTextButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeSearchTextButtonLight: {
    backgroundColor: '#f5f5f5',
  },
  removeSearchTextButtonDark: {
    backgroundColor: '#101010',
  },
  currentTopicContainer: {
    paddingHorizontal: 20,
  },
  currentTopicChip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
  },
  currentTopicContainerLight: {
    backgroundColor: '#fff',
  },
  currentTopicContainerDark: {
    backgroundColor: '#101010',
  },
  currentTopicText: {
    fontSize: 16,
    fontWeight: '400',
    marginRight: 8,
  },
  currentTopicTextLight: {
    color: '#000',
  },
  currentTopicTextDark: {
    color: '#fff',
  },
  removeTopicButton: {
    padding: 2,
  },
  removeTopicButtonLight: {
    backgroundColor: '#fff',
  },
  removeTopicButtonDark: {
    backgroundColor: '#101010',
  },
  bottomSheetList: {
    flex: 1,
    paddingBottom: 40,
  },
  bottomSheetListLight: {
    backgroundColor: '#fff',
  },
  bottomSheetListDark: {
    backgroundColor: '#101010',
  },
  newTopicIcon: {
    marginLeft: 8,
  },
});

export default modalStyles;
