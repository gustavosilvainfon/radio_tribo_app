import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

import { RADIO_CONFIG } from '../config/radio';
import ApiService from '../services/api';

const RADIO_STREAM_URL = RADIO_CONFIG.STREAM_URL;

export default function HomeScreen() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [radioInfo, setRadioInfo] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [streamUrl, setStreamUrl] = useState(RADIO_STREAM_URL);

  useEffect(() => {
    configureAudio();
    loadRadioData();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadRadioData = async () => {
    try {
      // Carregar informações da rádio
      const info = await ApiService.getRadioInfo();
      setRadioInfo(info);
      
      if (info.stream_url) {
        setStreamUrl(info.stream_url);
      }
      
      // Carregar música tocando agora
      const nowPlayingData = await ApiService.getNowPlaying();
      setNowPlaying(nowPlayingData);
    } catch (error) {
      console.log('Erro ao carregar dados da rádio:', error);
      // Continuar com dados padrão
    }
  };

  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Erro ao configurar áudio:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (sound === null) {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        setIsLoading(false);
        
        // Registrar ouvinte
        try {
          await ApiService.registerListenerJoin();
        } catch (err) {
          console.log('Erro ao registrar ouvinte:', err);
        }
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível conectar à rádio. Verifique sua conexão.');
      console.log('Erro no player:', error);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {radioInfo?.radio_name || 'RÁDIO TRIBO FM'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {radioInfo?.radio_slogan || 'Sua música, sua tribo!'}
        </Text>
      </View>

      {/* Logo/Cover Art */}
      <View style={styles.coverContainer}>
        <LinearGradient
          colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
          style={styles.coverArt}
        >
          <Ionicons name="radio" size={80} color="white" />
        </LinearGradient>
        
        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isPlaying ? '#4ecdc4' : '#ff6b6b' }]} />
          <Text style={styles.statusText}>
            {isLoading ? 'Conectando...' : isPlaying ? 'AO VIVO' : 'OFF-LINE'}
          </Text>
        </View>
      </View>

      {/* Now Playing Info */}
      <View style={styles.nowPlayingContainer}>
        <Text style={styles.nowPlayingTitle}>Agora Tocando</Text>
        <Text style={styles.songTitle}>
          {nowPlaying?.song_title || radioInfo?.radio_name || 'Rádio Tribo FM'}
        </Text>
        <Text style={styles.artist}>
          {nowPlaying?.artist || 'Transmissão ao vivo'}
        </Text>
      </View>

      {/* Player Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={stopPlayback}
          disabled={!sound}
        >
          <MaterialIcons
            name="stop"
            size={30}
            color={sound ? '#ffffff' : '#666666'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.loadingButton]}
          onPress={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? (
            <MaterialIcons name="sync" size={50} color="white" />
          ) : (
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={50}
              color="white"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => Alert.alert('Volume', 'Controle de volume em desenvolvimento')}
        >
          <MaterialIcons name="volume-up" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📻 Ouça onde estiver, quando quiser
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4ecdc4',
    textAlign: 'center',
    marginTop: 5,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  coverArt: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nowPlayingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  nowPlayingTitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  artist: {
    fontSize: 16,
    color: '#4ecdc4',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingButton: {
    backgroundColor: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
  },
});