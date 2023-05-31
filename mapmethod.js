import React, { useState, useEffect, Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  Button,
  ActivityIndicator,
  StatusBar,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableHighlight,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import XMLParser from "react-xml-parser";
//import * as Device from "expo-device";
//import * as Application from "expo-application";
//import { useDispatch  } from 'react-redux';

import Card from "../../component/Card"
import string from "../../constant/string";
import Colors from "../../constant/colors";
import Input from "../../component/Input";
import OTPTextView from 'react-native-otp-textinput';
import { getUserData, insertUserData, deleteUserDetails, fetchUserType } from '../../helpers/UserDetailsDb';
import colors from "../../constant/colors";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Moment from 'moment';
import { Icon } from "react-native-elements";
import Modal from "react-native-modal";
import axios from "axios";
const CaneTypeSummary = ({ navigation }) => {
  const [isloading, setIsLoading] = useState(false);
  const [factoryCode, setFactoryCode] = useState("0");
  const [userFromDb, setUserFromDb] = useState(getUserData);
  const [tableData, setTableData] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(true);
  const [factoryList, setFactoryList] = useState([]);
  const [supervisorFrom, setSupervisorFrom] = useState("0");
  const [supervisorTo, setSupervisorTo] = useState("9999");
  const [villageFrom, setVillageFrom] = useState("0");
  const [villageTo, setVillageTo] = useState("999999");
  const [varietyFrom, setVarietyFrom] = useState("0");
  const [varietyTo, setVarietyTo] = useState("999999");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isDatePickerFromVisible, setDatePickerFromVisibility] = useState(false);
  const [isDatePickerToVisible, setDatePickerToVisibility] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    //console.log(userFromDb);
    userFromDb.then((response) => {
      console.log(response.rows.item(0));
      setFactoryCode("0");
      setFactoryList([]);
      //getData("",dateFormated);
      if (response.rows.length == 0) {
        setFactoryList((factoryList) => [
          ...factoryList,
          {
            value: "0",
            label: 'No Factory Mapping',
          },
        ]);
      }
      else if (response.rows.length > 1) {
        setFactoryList((factoryList) => [
          ...factoryList,
          {
            value: "",
            label: 'Select Factory',
          },
        ]);
      }
      for (let i = 0; i < response.rows.length; i++) {
        //console.log(response.rows.item(i));
        setFactoryList((factoryList) => [
          ...factoryList,
          {
            value: response.rows.item(i).fact_id,
            label: response.rows.item(i).f_name,
          },
        ]);
      }

    });
    //getData();
  }, []);

  const loadData = () => {
    console.log('factoryCode', factoryCode);
    if (factoryCode == '0' || isNaN(factoryCode) || factoryCode == null) {
      Alert.alert("Error ", "Please select factory", [{ text: "Ok", style: "cancel" }]);
    }
    else if (supervisorFrom.length == 0) {
      Alert.alert("Error ", "Please enter supervisor from code ", [{ text: "Ok", style: "cancel" }]);
    }
    else {
      setModalVisible(false);
      setIsLoading(true);
      getData();
    }

  };

  const supervisorFromHandler = (enteredText) => {
    setSupervisorFrom(enteredText);
  };

  const supervisorToHandler = (enteredText) => {
    setSupervisorTo(enteredText);
  };

  const villageFromHandler = (enteredText) => {
    setVillageFrom(enteredText);
  };

  const villageToHandler = (enteredText) => {
    setVillageTo(enteredText);
  };

  const varietyFromHandler = (enteredText) => {
    setVarietyFrom(enteredText);
  };

  const varietyToHandler = (enteredText) => {
    setVarietyTo(enteredText);
  };

  const showDatePickerFrom = () => {
    setDatePickerFromVisibility(true);
  };

  const hideDatePickerFrom = () => {
    setDatePickerFromVisibility(false);
  };

  const handleFromDate = (date) => {
    Moment.locale('en');
    var dateFormated = Moment(date).format('YYYYMMDD');
    setDateFrom(dateFormated);
    hideDatePickerFrom();
  };

  const showDatePickerTo = () => {
    setDatePickerToVisibility(true);
  };

  const hideDatePickerTo = () => {
    setDatePickerToVisibility(false);
  };

  const handleToDate = (date) => {
    Moment.locale('en');
    var dateFormated = Moment(date).format('YYYYMMDD');
    setDateTo(dateFormated);
    hideDatePickerTo();
  };

  const getData = async () => {

    const data = 'factory=' + parseInt(factoryCode) + '&SupvcodeFrom=' + parseInt(supervisorFrom) + '&SupvcodeTo=' + parseInt(supervisorTo) + '&VillageFrom=' + parseInt(villageFrom) + '&VillageTo=' + parseInt(villageTo) + '&DateFrom=' + dateFrom + '&DateTo=' + dateTo;
    console.log(data);

    //axios is implementing
    try {
      const response = await axios.get(string.url + "/Survey_GetSupervisorCaneTypeArea?" + data);
      console.log(response.data);
      // return;
      setIsLoading(false);
      //console.log(textResponse);
      //xml = new XMLParser().parseFromString(textResponse);
      const jsonData1 = (response.data);
      if (jsonData1.API_STATUS == "Ok") {
        const jsonData = jsonData1.MSG;
        console.log(jsonData);
        setIsLoading(false);
        var jsonDataSupArray = [];
        var jsonDataVarietyArray = [];
        var jsonDataVillageArray = [];
        let oldSupCode = 0;
        let oldVillCode = 0;
        let villArea = 0, supArea = 0;
        let villPlot = 0, villGrower = 0, supPlot = 0, supGrower = 0;
        for (var i = 0; i < jsonData.length; i++) {
          if (oldSupCode == 0) {
            oldSupCode = jsonData[0].SUPVCODE;
          }
          if (oldVillCode == 0) {
            oldVillCode = jsonData[0].VCODE;
          }
          if (oldSupCode != jsonData[i].SUPVCODE) {
            var jsonDataVariety = {
              textColor: "white",
              backgroundColor: "blue",
              varCode: "",
              varName: "Total",
              plots: villPlot,
              growCount: villGrower,
              area: villArea,
            }
            jsonDataVarietyArray.push(jsonDataVariety);
            var jsonDataVillage = {
              villCode: jsonData[i - 1].VCODE,
              villName: jsonData[i - 1].VNAME,
              jsonDataVariety: jsonDataVarietyArray,
            }
            // first add in jsonDataVariety 
            jsonDataVillageArray.push(jsonDataVillage);
            jsonDataVarietyArray = [];
            supArea += villArea;
            supPlot += villPlot;
            supGrower += villGrower;
            villArea = 0;
            villPlot = 0;
            villGrower = 0;

            oldSupCode = jsonData[i].SUPVCODE;
            var jsonDataSupervisor = {
              supCode: jsonData[i - 1].SUPVCODE,
              supName: jsonData[i - 1].SUPVNAME,
              supArea: supArea,
              supPlot: supPlot,
              supGrower: supGrower,
              jsonDataVillage: jsonDataVillageArray,
            }
            //console.log(jsonDataSupervisor.supArea+"Jai Bajarang Baliis")
            jsonDataSupArray.push(jsonDataSupervisor);
            jsonDataVillageArray = [];
            oldVillCode = jsonData[i].VCODE
            // console.log(oldVillCode);
            supArea = 0;
            supPlot = 0;
            supGrower = 0;
          }
          else {
            if (oldVillCode != jsonData[i].VCODE) {
              var jsonDataVariety = {
                textColor: "white",
                backgroundColor: "blue",
                varCode: "",
                varName: "Total",
                plots: villPlot,
                growCount: villGrower,
                area: villArea,
              }
              console.log(jsonDataVariety.area + "Area of jsondataVariety")
              jsonDataVarietyArray.push(jsonDataVariety);
              supArea += villArea;
              supPlot += villPlot;
              supGrower += villGrower;
              villArea = 0;
              villPlot = 0;
              villGrower = 0;
              oldVillCode = jsonData[i].VCODE
              var jsonDataVillage = {
                villCode: jsonData[i - 1].VCODE,
                villName: jsonData[i - 1].VNAME,
                jsonDataVariety: jsonDataVarietyArray,
              }
              jsonDataVillageArray.push(jsonDataVillage);
              jsonDataVarietyArray = [];
              var jsonDataVariety = {
                textColor: "black",
                backgroundColor: "white",
                varCode: jsonData[i].ATCODE,
                varName: jsonData[i].ATNAME,
                plots: jsonData[i].PLOTS,
                growCount: jsonData[i].GROWCOUNT,
                area: jsonData[i].AREA,
              }

              jsonDataVarietyArray.push(jsonDataVariety);
              villArea = jsonData[i].AREA;
              villPlot = jsonData[i].PLOTS;
              villGrower = jsonData[i].GROWCOUNT;
            }
            else {
              villArea += jsonData[i].AREA;
              villPlot += jsonData[i].PLOTS;
              villGrower += jsonData[i].GROWCOUNT;
              //uncommented here then resolve the issue above 3 line
              supArea += jsonData[i].AREA;
              supPlot += jsonData[i].PLOTS;
              supGrower += jsonData[i].GROWCOUNT;
              var jsonDataVariety = {
                textColor: "black",
                backgroundColor: "white",
                varCode: jsonData[i].ATCODE,
                varName: jsonData[i].ATNAME,
                plots: jsonData[i].PLOTS,
                growCount: jsonData[i].GROWCOUNT,
                area: jsonData[i].AREA,
              }
              jsonDataVarietyArray.push(jsonDataVariety);
            }
          }
        }
        var jsonDataVariety = {
          textColor: "white",
          backgroundColor: "blue",
          varCode: "",
          varName: "Total",
          plots: villPlot,
          growCount: villGrower,
          area: villArea,
        }
        console.log(jsonDataVariety.area + "Area pyyyyyyyy")
        jsonDataVarietyArray.push(jsonDataVariety);
        villArea = 0;
        villPlot = 0;
        villGrower = 0;
        var jsonDataVillage = {
          villCode: jsonData[parseInt(jsonData.length) - 1].VCODE,
          villName: jsonData[parseInt(jsonData.length) - 1].VNAME,
          jsonDataVariety: jsonDataVarietyArray,
        }
        jsonDataVillageArray.push(jsonDataVillage);
        var jsonDataSupervisor = {
          supCode: jsonData[parseInt(jsonData.length) - 1].SUPVCODE,
          supName: jsonData[parseInt(jsonData.length) - 1].SUPVNAME,
          supArea: supArea,
          supPlot: supPlot,
          supGrower: supGrower,
          jsonDataVillage: jsonDataVillageArray,
        }
        // console.log(jsonDataSupervisor.supArea)
        console.log(jsonDataVillage);
        jsonDataSupArray.push(jsonDataSupervisor);
        setJsonData(jsonDataSupArray);
        //console.log('jsonDataSupArray', jsonDataSupArray);
        //  setJsonData((jsonData) => [
        //    ...jsonData,
        //   {
        //     supCode: "0",
        //     supName: "0",
        //    villCode: "0",
        //   villName: "0",
        //    jsonDataArray: jsonDataVarietyArray,
        //   },
        //  ]);
      }
      else {
        var jsonDataSupArray = [];
        var jsonDataVarietyArray = [];
        var jsonDataVillageArray = [];
        setJsonData([]);
        Alert.alert("Error ", jsonData1.MSG, [{ text: "Ok", style: "cancel" }]);
        navigation.pop();
      }

    } catch (error) {
      console.log(error);
      if (error.message.includes("JSON Parse error")) {
        Alert.alert("Error ", "Data not found", [{ text: "Ok", style: "cancel" }]);
      } else {
        Alert.alert("Server Error ", error.message, [
          { text: "Ok", style: "cancel" },
        ]);
      }
    }
    //axio ending
  };

  const factoryHandler = (value) => {
    setFactoryCode(value);
  };


  const renderGridItem = (jsonData) => {
    //console.log(tableData);
    return (
      <View style={[styles.table, { width: '100%' }]} key={tableData.item.m_Centre}>
        <Text style={[styles.td, { width: '40%' }]}>Cane Type</Text>
        <Text style={[styles.td, { width: '20%' }]}>Area</Text>
        <Text style={[styles.td, { width: '20%' }]}>Plot</Text>
        <Text style={[styles.td, { width: '20%' }]}>Grower</Text>
      </View>
    );
  };


  if (isloading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={{ color: '#000', marginTop: 30 }}>Please wait while we processes your request...</Text>
        </View>
      </View>);
  }

  return (

    <View style={styles.container}>
      <StatusBar backgroundColor={colors.accent} />
      <Modal
        isVisible={isModalVisible}
        backdropOpacity={1}
        animationIn={'zoomInDown'}
        animationOut={'zoomOutUp'}
        animationInTiming={500}
        animationOutTiming={500}
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={500}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalContent}>
            <Text onPress={toggleModal} style={styles.buttonCloseModal}>X</Text>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>Search Data</Text>
              <View style={styles.divider}></View>
            </View>
            <View style={{ maxHeight: 350, padding: 0 }}>
              <ScrollView >
                <View style={[styles.modalBody]}>
                  <Text style={styles.cardSubTitleText}>Factory</Text>
                  <RNPickerSelect
                    onValueChange={(value) => factoryHandler(value)}
                    items={factoryList}
                    style={pickerSelectStylesModal}
                    useNativeAndroidPickerStyle={true}
                  />
                  <Text style={styles.cardSubTitleText}>Supervisor Code From</Text>
                  <Input
                    placeholder="Enter Code"
                    style={styles.input}
                    value={supervisorFrom}
                    keyboardType={'decimal-pad'}
                    onChangeText={supervisorFromHandler}
                  />
                  <Text style={styles.cardSubTitleText}>Supervisor Code To</Text>
                  <Input
                    placeholder="Enter Code"
                    style={styles.input}
                    value={supervisorTo}
                    keyboardType={'decimal-pad'}
                    onChangeText={supervisorToHandler}
                  />
                  <Text style={styles.cardSubTitleText}>Village Code From</Text>
                  <Input
                    placeholder="Enter Code"
                    style={styles.input}
                    value={villageFrom}
                    keyboardType={'decimal-pad'}
                    onChangeText={villageFromHandler}
                  />
                  <Text style={styles.cardSubTitleText}>Village Code To</Text>
                  <Input
                    placeholder="Enter Code"
                    style={styles.input}
                    value={villageTo}
                    keyboardType={'decimal-pad'}
                    onChangeText={villageToHandler}
                  />
                  <Text style={styles.cardSubTitleText}>From Date</Text>
                  <View style={{ flexDirection: 'row', width: '100%' }}>
                    <View style={{ marginTop: 10, marginBottom: 10, width: '88%' }}>
                      <Input placeholder="Select Valid Date" style={styles.input} editable={false} value={dateFrom} />
                    </View>
                    <View >
                      <TouchableOpacity onPress={() => showDatePickerFrom()} >
                        <Image
                          source={require("../../../assets/date_icon.png")}
                          style={{ height: 40, width: 40 }}
                          onPress={() => showDatePickerFrom()}
                        />
                      </TouchableOpacity>
                    </View>
                    <DateTimePickerModal
                      isVisible={isDatePickerFromVisible}
                      mode="date"
                      onConfirm={handleFromDate}
                      onCancel={hideDatePickerFrom}
                    />
                  </View>

                  <Text style={styles.cardSubTitleText}>To Date</Text>
                  <View style={{ flexDirection: 'row', width: '100%' }}>
                    <View style={{ marginTop: 10, marginBottom: 10, width: '88%' }}>
                      <Input placeholder="Select Valid Date" style={styles.input} editable={false} value={dateTo} />
                    </View>
                    <View >
                      <TouchableOpacity onPress={() => showDatePickerTo()} >
                        <Image
                          source={require("../../../assets/date_icon.png")}
                          style={{ height: 40, width: 40 }}
                          onPress={() => showDatePickerTo()}
                        />
                      </TouchableOpacity>
                    </View>
                    <DateTimePickerModal
                      isVisible={isDatePickerToVisible}
                      mode="date"
                      onConfirm={handleToDate}
                      onCancel={hideDatePickerTo}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
            <View style={styles.modalHeader}>
              <Button style={styles.buttonModal} title="Search" value="Title" onPress={loadData}></Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ScrollView>
        {/* <FlatList */}
        {
          // data={jsonData}
          // renderItem={(outerItem) => (

          jsonData.map((outerItem) => {
            return (
              <View style={{ margin: 5 }}>
                <Card style={{ padding: 10 }}>
                  <View>
                    <Text style={{ color: 'blue', fontSize: 16 }}>{outerItem.supCode} / {outerItem.supName}</Text>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                      <Text style={{ textAlign: 'left', width: '50%', color: 'black' }}>Total Area</Text>
                      <Text style={{ textAlign: 'right', width: '50%', color: 'black' }}>{parseFloat(outerItem.supArea).toFixed(3)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                      <Text style={{ textAlign: 'left', width: '50%', color: 'black' }}>Total Plot</Text>
                      <Text style={{ textAlign: 'right', width: '50%', color: 'black' }}>{parseFloat(outerItem.supPlot).toFixed(0)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                      <Text style={{ textAlign: 'left', width: '50%', color: 'black' }}>Total Grower</Text>
                      <Text style={{ textAlign: 'right', width: '50%', color: 'black' }}>{parseFloat(outerItem.supGrower).toFixed(0)}</Text>
                    </View>

                    {
                      outerItem.jsonDataVillage.map((vllageItem) => {
                        return(
                        <View>
                          <Text style={{ color: 'orange', fontSize: 16 }}>{vllageItem.villCode} / {vllageItem.villName}</Text>
                          <ScrollView>
                            <View>
                              <View style={[styles.table, { width: '100%' }]}>
                                <Text style={[styles.th, { width: '55%' }]}>Variety</Text>
                                <Text style={[styles.th, { width: '15%' }]}>Area</Text>
                                <Text style={[styles.th, { width: '15%' }]}>Plot</Text>
                                <Text style={[styles.th, { width: '15%' }]}>Grower</Text>
                              </View>
                              {/* <FlatList
                              data={vllageItem.jsonDataVariety}
                              renderItem={(varietyItem) => ( */}
                              {
                                vllageItem.jsonDataVariety.map((varietyItem) => {
                                  return(
                                  <View style={[styles.table, { width: '100%' }]} key={varietyItem.varCode}>
                                    <Text style={[styles.td, { width: '55%', color: varietyItem.textColor, backgroundColor: varietyItem.backgroundColor }]}>{varietyItem.varCode} {varietyItem.varName}</Text>
                                    <Text style={[styles.td, { width: '15%', textAlign: 'center', color: varietyItem.textColor, backgroundColor: varietyItem.backgroundColor }]}>{parseFloat(varietyItem.area).toFixed(3)}</Text>
                                    <Text style={[styles.td, { width: '15%', textAlign: 'center', color: varietyItem.textColor, backgroundColor: varietyItem.backgroundColor }]}>{parseFloat(varietyItem.plots).toFixed(3)}</Text>
                                    <Text style={[styles.td, { width: '15%', textAlign: 'center', color: varietyItem.textColor, backgroundColor: varietyItem.backgroundColor }]}>{parseFloat(varietyItem.growCount).toFixed(3)}</Text>
                                  </View>
                                  )
                                })
                              }
                            </View>
                          </ScrollView>
                        </View>
                        )
                      })
                    }

                  </View>
                </Card>
              </View>

            )
          }
          )
        }
      </ScrollView>
    </View>
  );
};

CaneTypeSummary.navigationOptions = {
  headerTitle: 'Trucks Screen',
  headerLeft: () => {
    return null;
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  card: {
    height: 130,
    width: "100%",
    backgroundColor: Colors.transparent,
  },
  table: {
    flexDirection: "row"
  },
  th: {
    flex: 1,
    flexWrap: 'wrap',
    width: 100,
    borderColor: "gray",
    height: 38,
    paddingTop: 13,
    textAlign: "center",
    borderWidth: 1,
    fontSize: 10,
    backgroundColor: 'black',
    color: 'white'
  },
  td: {
    flex: 1,
    flexWrap: 'wrap',
    width: 100,
    color: 'black',
    backgroundColor: 'white',
    borderColor: "gray",
    height: 38,
    paddingTop: 13,
    textAlign: "center",
    fontSize: 10,
    borderWidth: 1,
  },
  headerTextLg: {
    textAlign: "left",
    fontSize: 20,
    color: "black",
    color: colors.accent,
    fontWeight: 'bold',
  },
  headerTextSm: {
    textAlign: "left",
    fontSize: 14,
    color: "black",
    color: colors.accent
  },
  horizentalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  spinnerBorder: {
    margin: 10,
    fontSize: 12,
    borderBottomWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
  },
  input: {
    fontSize: 15,
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "black",
    //borderRadius: 8,
    color: "black",
    width: '100%',
    paddingRight: 30,
  },
  submit: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
    width: '100%',
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 15,
  },
  datePickerTextContainer: {
    flex: 9,
    color: '#000'
  },
  datePickerIconContainer: {
    flex: 1,
  },

  modalHeader: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalBody: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: '100%',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#000"
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "lightgray"
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 4,
    width: '100%',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonModal: {
    backgroundColor: 'lightblue',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    width: '50%',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderRadius: 20,
    borderColor: 'lightblue',
  },
  buttonCloseModal: {
    backgroundColor: 'lightblue',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderRadius: 20,
    borderColor: 'lightblue',
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerTextContainer: {
    flex: 9,
  },
  datePickerIconContainer: {
    flex: 1,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: 'black',
    width: '100%',
    //borderRadius: 4,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 15,
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "black",
    width: '100%',
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },



});

const pickerSelectStylesModal = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: 'black',
    width: '100%',
    //borderRadius: 4,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 15,
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "black",
    width: '100%',
    //borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },

});

export default CaneTypeSummary;
