import { Pressable, Text, StyleSheet } from "react-native"
import { IconSymbol } from "./ui/IconSymbol";

interface FilledButtonProps {
    text: string;
    imageSource: string;
}

export function FilledButton({text, imageSource}: FilledButtonProps) {
    return (
        <Pressable style={styles.button}>
            <Text style={styles.buttonText}>{text}</Text>
            <IconSymbol name="arrow.right" color="#000" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        gap: 8,
        width: '100%',
        maxHeight: 64,
        paddingVertical: 16,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonImage: {
        width: 24,
        height: 24,
    },
})