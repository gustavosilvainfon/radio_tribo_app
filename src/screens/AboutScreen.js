import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function AboutScreen() {
  const openSocialMedia = (url, platform) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erro', `Não foi possível abrir ${platform}`);
        }
      })
      .catch((err) => console.error('Erro ao abrir link:', err));
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://facebook.com/radiotribofm',
      color: '#3b5998',
    },
    {
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/radiotribofm',
      color: '#E4405F',
    },
    {
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      url: 'https://wa.me/5511999999999',
      color: '#25D366',
    },
  ];

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
            style={styles.logoContainer}
          >
            <Ionicons name="radio" size={60} color="white" />
          </LinearGradient>
          <Text style={styles.headerTitle}>RÁDIO TRIBO FM</Text>
          <Text style={styles.headerSubtitle}>Sua música, sua tribo!</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre Nós</Text>
          <Text style={styles.description}>
            A Rádio Tribo FM é mais que uma rádio, é uma comunidade musical que conecta pessoas através da música de qualidade. 
            Transmitindo 24 horas por dia, trazemos o melhor da música nacional e internacional, 
            com programação diversificada e locutores apaixonados pela arte de comunicar.
          </Text>
        </View>

        {/* Programming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programação</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>06:00 - 10:00</Text>
              <Text style={styles.scheduleShow}>Manhã na Tribo</Text>
              <Text style={styles.scheduleDescription}>Desperte com energia e boa música</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>10:00 - 14:00</Text>
              <Text style={styles.scheduleShow}>Música Sem Fronteiras</Text>
              <Text style={styles.scheduleDescription}>O melhor da música internacional</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>14:00 - 18:00</Text>
              <Text style={styles.scheduleShow}>Tarde Brasileira</Text>
              <Text style={styles.scheduleDescription}>Sucessos nacionais de todos os tempos</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>18:00 - 22:00</Text>
              <Text style={styles.scheduleShow}>Night Mix</Text>
              <Text style={styles.scheduleDescription}>Hits para curtir a noite</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#4ecdc4" />
              <Text style={styles.contactText}>(11) 9999-9999</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#4ecdc4" />
              <Text style={styles.contactText}>contato@radiotribofm.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#4ecdc4" />
              <Text style={styles.contactText}>São Paulo, SP - Brasil</Text>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociais</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { backgroundColor: social.color }]}
                onPress={() => openSocialMedia(social.url, social.name)}
              >
                <Ionicons name={social.icon} size={30} color="white" />
                <Text style={styles.socialText}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Aplicativo Rádio Tribo FM</Text>
          <Text style={styles.footerVersion}>Versão 1.0.0</Text>
          <Text style={styles.footerCopyright}>© 2024 Rádio Tribo FM</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4ecdc4',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    textAlign: 'justify',
  },
  scheduleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  scheduleItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#4ecdc4',
    fontWeight: 'bold',
  },
  scheduleShow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  contactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    minWidth: 80,
  },
  socialText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footerVersion: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
});