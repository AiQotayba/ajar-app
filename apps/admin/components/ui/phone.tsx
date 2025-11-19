export default function Phone({ text }: any) {
    return (
        <span className="text-xs text-end font-light" style={{ direction: "ltr", unicodeBidi: "plaintext" }}>{text}</span>

    )
}