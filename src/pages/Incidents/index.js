import React,{useState,useEffect} from 'react';
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { View,FlatList, Image,Animated, Text, TouchableOpacity } from 'react-native';
import api from '../../services/api';
import styles from './styles';

import logoImg from '../../assets/logo.png';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page,setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing,setRefreshing] = useState(false);
  const [offset,setOffset] = useState(new Animated.ValueXY({ x:0, y: 100}));
  const [opacity,setOpacity] = useState(new Animated.Value(0));
  const [scrollOffset,setScrollOffset] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  function navigateToDetail(incident) {
    navigation.navigate('Detail',{incident})
  }

 
  async function loadIncidents(pageNumber=page,shouldRefresh=false){

    Animated.parallel([
      Animated.spring(offset.y, {
        toValue: 0,
        speed: 5,
        bounciness: 20,
      }),
      Animated.timing(opacity,{
        toValue: 1,
        duration: 800,
      }),
    ]).start();

    if(loading){
      return;
    }

    if(total > 0 && incidents.length === total){
      return;
    }
    
    
    setLoading(true);

    const response = await api.get('/incidents',{
      params: { page:pageNumber }
    });
    
     
    setIncidents(
      shouldRefresh ? 
        response.data : 
        [...incidents,...response.data]
      );
  
    
    
    setTotal(response.headers['x-total-count']);
    setPage(pageNumber+1);
    setLoading(false);
    
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadIncidents(1,true);
    setRefreshing(false);
  }

  useEffect(()=>{
    loadIncidents();
  }, [])

  return (
    
    <View style={styles.container}>
      
      <Animated.View style={[
        {
          height: scrollOffset.interpolate({
            inputRange: [0,140],
            outputRange: [140,20],
            extrapolate: 'clamp',
          })
        }
        ]}>
        <View style={styles.header}>
        <Image source={logoImg} />
        <Text style={styles.headerText}>
          Total de <Text style={ styles.headerTextBold}>{total} casos</Text>.
        </Text>
        </View>
        <Animated.Text style={[
          styles.title,
          {
           opacity: scrollOffset.interpolate({
             inputRange: [0,30],
             outputRange: [30,0],
             
           }),
           fontSize: scrollOffset.interpolate({
            inputRange: [0,30],
            outputRange: [30,0],
            
           })
          }]}>Bem Vindo!</Animated.Text>

        <Animated.Text style={[
          styles.description,
          {
           opacity: scrollOffset.interpolate({
             inputRange: [0,16],
             outputRange: [16,0],
             
           }),
           fontSize: scrollOffset.interpolate({
            inputRange: [0,16],
            outputRange: [16,0],
            
           })
          }]}>Escolha um dos casos abaixo e salve o dia.</Animated.Text>
      </Animated.View>

      <FlatList 
        scrollEventThrottle={18}
        onScroll={
          Animated.event([{
            nativeEvent: {
              contentOffset: { y: scrollOffset }
            }
          }])
        }
        data={incidents}
        style={styles.incidentList}
        keyExtractor={incident => String(incident.id)}
        showsVerticalScrollIndicator={true}
        onEndReached={() => loadIncidents()}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({item: incident})=>(
          <Animated.View style={[
            { transform: [ ...offset.getTranslateTransform() ] },
            { opacity }
          ]} >
          <View style={styles.incident}>
            <Text style={styles.incidentProperty}>ONG:</Text>
            <Text style={styles.incidentValue}>{incident.name}</Text>

            <Text style={styles.incidentProperty}>CASO:</Text>
            <Text style={styles.incidentValue}>{incident.title}</Text>

            <Text style={styles.incidentProperty}>VALOR:</Text>
            <Text style={styles.incidentValue}>{Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL'
              }).format(incident.value)}
            </Text>

            <TouchableOpacity 
              style={styles.detailsButton} 
              onPress={() => navigateToDetail(incident)}
              >
                <Text style={styles.detailsButtonText}> Ver mais detalhes</Text>
                <Feather name="arrow-right" size={16} color="#E02041" />
            </TouchableOpacity>
          </View>
         </Animated.View>
        )}
      />
        
    </View>

   
  );
}
