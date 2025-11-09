import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';

interface KVKKConsentModalProps {
  visible: boolean;
  onAccept: () => void;
}

export default function KVKKConsentModal({ visible, onAccept }: KVKKConsentModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (visible) {
      setHasScrolledToBottom(false);
    }
  }, [visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}} // Prevent closing without accepting
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={32} color={Colors.blue[400]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>WhatsApp Hizmeti Aydınlatma Metni</Text>
              <Text style={styles.headerSubtitle}>KVKK ve Gizlilik Politikası</Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.content}>
              {/* Veri Sorumlusu */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Veri Sorumlusu</Text>
                <Text style={styles.sectionText}>
                  Bu WhatsApp servisi kapsamında toplanan kişisel verilerinizin veri sorumlusu{' '}
                  <Text style={styles.bold}>Allync</Text> olup, verileriniz 6698 sayılı Kişisel
                  Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir.
                </Text>
              </View>

              {/* Toplanan Veriler */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔍 Toplanan Veriler</Text>
                <Text style={styles.sectionText}>
                  WhatsApp servisi kapsamında aşağıdaki veriler toplanmaktadır:
                </Text>
                <View style={styles.listContainer}>
                  <Text style={styles.listItem}>• WhatsApp telefon numaranız</Text>
                  <Text style={styles.listItem}>• Adınız ve profil bilgileriniz</Text>
                  <Text style={styles.listItem}>• Gönderdiğiniz ve aldığınız mesajlar</Text>
                  <Text style={styles.listItem}>
                    • Mesaj gönderim zamanları ve oturum bilgileri
                  </Text>
                  <Text style={styles.listItem}>
                    • Bot ile yaptığınız etkileşimler ve sorgu geçmişi
                  </Text>
                  <Text style={styles.listItem}>• Hata kayıtları ve sistem logları</Text>
                </View>
              </View>

              {/* Veri İşleme Amaçları */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Veri İşleme Amaçları</Text>
                <Text style={styles.sectionText}>
                  Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                </Text>
                <View style={styles.listContainer}>
                  <Text style={styles.listItem}>• WhatsApp botunun size hizmet sunabilmesi</Text>
                  <Text style={styles.listItem}>
                    • Mesajlarınızın kaydedilmesi ve analiz edilmesi
                  </Text>
                  <Text style={styles.listItem}>
                    • Müşteri destek taleplerinin yönetilmesi
                  </Text>
                  <Text style={styles.listItem}>• Hizmet kalitesinin iyileştirilmesi</Text>
                  <Text style={styles.listItem}>• İstatistiksel analizler ve raporlama</Text>
                  <Text style={styles.listItem}>
                    • Yasal yükümlülüklerin yerine getirilmesi
                  </Text>
                </View>
              </View>

              {/* Veri Güvenliği */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔒 Veri Güvenliği</Text>
                <Text style={styles.sectionText}>
                  Kişisel verileriniz, KVKK ve ilgili mevzuat kapsamında uygun güvenlik
                  önlemleriyle korunmaktadır. Verileriniz şifrelenmiş olarak saklanır ve yetkisiz
                  erişime karşı korunur.
                </Text>
              </View>

              {/* Haklarınız */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚖️ Haklarınız</Text>
                <Text style={styles.sectionText}>
                  KVKK kapsamında aşağıdaki haklara sahipsiniz:
                </Text>
                <View style={styles.listContainer}>
                  <Text style={styles.listItem}>
                    • Kişisel verilerinizin işlenip işlenmediğini öğrenme
                  </Text>
                  <Text style={styles.listItem}>• İşlenmişse bilgi talep etme</Text>
                  <Text style={styles.listItem}>
                    • İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
                  </Text>
                  <Text style={styles.listItem}>
                    • Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme
                  </Text>
                  <Text style={styles.listItem}>
                    • Verilerin eksik veya yanlış işlenmişse düzeltilmesini isteme
                  </Text>
                  <Text style={[styles.listItem, { color: Colors.red[400], fontWeight: 'bold' }]}>
                    • Verilerin silinmesini veya yok edilmesini talep etme
                  </Text>
                  <Text style={styles.listItem}>
                    • İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle
                    aleyhinize bir sonucun ortaya çıkması durumunda buna itiraz etme
                  </Text>
                </View>
              </View>

              {/* Veri Silme Hakkı */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗑️ Veri Silme Hakkı</Text>
                <Text style={styles.sectionText}>
                  Dilediğiniz zaman <Text style={styles.bold}>Settings (Ayarlar)</Text> sekmesinden
                  <Text style={{ color: Colors.red[400], fontWeight: 'bold' }}>
                    {' '}
                    "Verilerimi Sil"
                  </Text>{' '}
                  butonuna tıklayarak tüm WhatsApp mesaj geçmişinizi ve kişisel verilerinizi kalıcı
                  olarak silebilirsiniz. Bu işlem geri alınamaz.
                </Text>
              </View>

              {/* İletişim */}
              <View style={[styles.section, styles.contactSection]}>
                <Text style={styles.sectionTitle}>📧 İletişim</Text>
                <Text style={styles.sectionText}>
                  KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için:{' '}
                  <Text style={styles.emailText}>privacy@allync.com</Text>
                </Text>
              </View>

              {/* Warning Box */}
              <View style={styles.warningBox}>
                <Ionicons
                  name="warning"
                  size={20}
                  color={Colors.orange[400]}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.warningText}>
                  <Text style={styles.bold}>Önemli:</Text> Bu servisi kullanmaya devam ederek
                  yukarıdaki aydınlatma metnini okuduğunuzu ve kişisel verilerinizin belirtilen
                  amaçlarla işlenmesine açık rıza gösterdiğinizi kabul etmiş olursunuz.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Accept Button */}
          <View style={styles.footer}>
            {/* Scroll Indicator */}
            {!hasScrolledToBottom && (
              <View style={styles.scrollIndicator}>
                <Ionicons name="arrow-down" size={16} color={Colors.orange[400]} />
                <Text style={styles.scrollIndicatorText}>
                  Devam etmek için lütfen aşağı kaydırın
                </Text>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color={Colors.orange[400]}
                  style={{ opacity: 0.7 }}
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.acceptButton,
                !hasScrolledToBottom && styles.acceptButtonDisabled,
              ]}
              onPress={onAccept}
              activeOpacity={hasScrolledToBottom ? 0.8 : 1}
              disabled={!hasScrolledToBottom}
            >
              <LinearGradient
                colors={
                  hasScrolledToBottom
                    ? [Colors.blue[500], Colors.blue[600]]
                    : ['#4B5563', '#374151']
                }
                style={styles.acceptButtonGradient}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={hasScrolledToBottom ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.acceptButtonText,
                    !hasScrolledToBottom && styles.acceptButtonTextDisabled,
                  ]}
                >
                  ✓ Okudum, Anladım ve Kabul Ediyorum
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              {hasScrolledToBottom
                ? 'Bu metni kabul ederek kişisel verilerinizin işlenmesine onay vermiş olursunuz.'
                : 'Aydınlatma metnini sonuna kadar okumadan kabul edemezsiniz.'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#0B1429',
    borderRadius: BorderRadius['3xl'],
    borderWidth: 2,
    borderColor: Colors.blue[500] + '80',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.blue[300],
  },
  contentScroll: {
    maxHeight: 500,
  },
  content: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  listContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  listItem: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    paddingLeft: Spacing.sm,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.lg,
  },
  emailText: {
    color: Colors.blue[400],
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.orange[300],
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  scrollIndicatorText: {
    fontSize: 13,
    color: Colors.orange[400],
    fontWeight: '600',
  },
  acceptButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  acceptButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footerNote: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
