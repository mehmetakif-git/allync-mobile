import { useRouter, useLocalSearchParams } from 'expo-router';
import WhatsAppServiceView from '../../components/services/WhatsAppServiceView';

export default function WhatsAppServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.serviceId as string;

  const handleBack = () => {
    router.back();
  };

  if (!serviceId) {
    return null;
  }

  return <WhatsAppServiceView serviceId={serviceId} onBack={handleBack} />;
}
