import { View, type ViewProps, StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Style object for the content area.
   */
  contentStyle?: ViewProps["style"];
  /**
   * Style object for the outer container (background layer).
   */
  containerStyle?: ViewProps["style"];
  /**
   * Style object for the SafeAreaView (content layer).
   */
  safeAreaStyle?: ViewProps["style"];
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer contentStyle={{ padding: 16 }}>
 *   <Text style={{ fontSize: 24, fontWeight: "700" }}>
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  contentStyle,
  containerStyle,
  safeAreaStyle,
  style,
  ...props
}: ScreenContainerProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <View
      style={[styles.container, containerStyle]}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        style={[styles.safeArea, safeAreaStyle, style]}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
