import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, ThemeColors } from '../constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface OnboardingGuideProps {
  visible: boolean;
  onComplete: () => void;
  isDark: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Time Box',
    description: 'Your smart task manager with powerful reminders. Organize your tasks by categories and never miss important deadlines.',
    icon: 'checkmark-circle',
    color: '#4CAF50',
  },
  {
    id: 2,
    title: 'Create Tasks',
    description: 'Tap the + button to create new tasks. Add titles, descriptions, due dates, and set priority levels.',
    icon: 'add-circle',
    color: '#2196F3',
  },
  {
    id: 3,
    title: 'Set Reminders',
    description: 'Enable reminders with custom times. Get notifications even when the app is closed or your device is locked.',
    icon: 'notifications',
    color: '#FF9800',
  },
  {
    id: 4,
    title: 'Organize by Categories',
    description: 'Use categories like Work, Personal, Shopping to keep your tasks organized. Each category shows pending task counts.',
    icon: 'folder',
    color: '#9C27B0',
  },
  {
    id: 5,
    title: 'Smart Scheduling',
    description: 'Set recurring tasks (daily, weekly, monthly) and use priority levels to focus on what matters most.',
    icon: 'repeat',
    color: '#E91E63',
  },
  {
    id: 6,
    title: 'You\'re All Set!',
    description: 'Start creating your first task and experience the power of smart task management with reminders.',
    icon: 'rocket',
    color: '#4CAF50',
  },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  visible,
  onComplete,
  isDark,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToIndex({ index: nextStep, animated: true });
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      flatListRef.current?.scrollToIndex({ index: prevStep, animated: true });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentStep(index);
  };

  const renderOnboardingStep = ({ item, index }: { item: OnboardingStep; index: number }) => (
    <View style={[styles.stepContainer, { width: screenWidth }]}>
      <View style={styles.stepContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons
            name={item.icon}
            size={80}
            color={item.color}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Feature highlights for specific steps */}
        {index === 2 && (
          <View style={styles.featureList}>
            <FeatureItem
              icon="alarm"
              text="Set custom reminder times"
              colors={colors}
            />
            <FeatureItem
              icon="phone-portrait"
              text="Works when app is closed"
              colors={colors}
            />
            <FeatureItem
              icon="lock-closed"
              text="Shows on locked screen"
              colors={colors}
            />
          </View>
        )}

        {index === 3 && (
          <View style={styles.featureList}>
            <FeatureItem
              icon="briefcase"
              text="Work"
              colors={colors}
            />
            <FeatureItem
              icon="home"
              text="Personal"
              colors={colors}
            />
            <FeatureItem
              icon="basket"
              text="Shopping"
              colors={colors}
            />
          </View>
        )}

        {index === 4 && (
          <View style={styles.featureList}>
            <FeatureItem
              icon="calendar"
              text="Daily, Weekly, Monthly repeats"
              colors={colors}
            />
            <FeatureItem
              icon="flag"
              text="High, Medium, Low priority"
              colors={colors}
            />
            <FeatureItem
              icon="time"
              text="Custom intervals"
              colors={colors}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicatorContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.stepIndicatorActive,
                  index < currentStep && styles.stepIndicatorCompleted,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          ref={flatListRef}
          data={onboardingSteps}
          renderItem={renderOnboardingStep}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          bounces={false}
          style={styles.carousel}
        />

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name={currentStep === onboardingSteps.length - 1 ? 'checkmark' : 'chevron-forward'} 
                size={20} 
                color={colors.background} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.stepCounter}>
            {currentStep + 1} of {onboardingSteps.length}
          </Text>
          <Text style={styles.swipeHint}>
            Swipe left/right to navigate • Tap buttons for control
          </Text>
        </View>
      </View>
    </Modal>
  );
};

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: ThemeColors;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, colors }) => {
  const featureStyles = StyleSheet.create({
    featureItem: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 8,
      minWidth: '29%',
      maxWidth: '29%',
    },
    featureText: {
      fontSize: 12,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

  return (
    <View style={[featureStyles.featureItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={[featureStyles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    stepIndicatorActive: {
      backgroundColor: colors.primary,
      width: 24,
    },
    stepIndicatorCompleted: {
      backgroundColor: colors.success,
    },
    skipButton: {
      padding: 8,
    },
    skipButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    content: {
      flex: 1,
    },
    carousel: {
      flex: 1,
    },
    stepContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    stepContent: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 40,
      justifyContent: 'center',
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    featureList: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
    featureText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    previousButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previousButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
      marginLeft: 4,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      minWidth: 120,
      justifyContent: 'center',
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
      marginRight: 8,
    },
    stepCounter: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    swipeHint: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      opacity: 0.7,
    },
  });
