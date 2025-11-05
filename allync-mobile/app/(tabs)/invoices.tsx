import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { PageTransition } from '../../components/PageTransition';
import { useTheme } from '../../contexts/ThemeContext';

export default function Invoices() {
  const { colors } = useTheme();

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Invoices</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your invoices and payment history will appear here</Text>
        </ScrollView>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});
