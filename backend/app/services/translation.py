from deep_translator import GoogleTranslator # type: ignore

def translate_text(text: str, target_lang: str) -> str:
    """
    Translates text from English to the target language code (e.g., 'hi', 'fr', 'es').
    """
    try:
        # If the target is English, skip translation
        if target_lang == "en":
            return text

        translator = GoogleTranslator(source='auto', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation Error: {e}")
        return text  # Return original if translation fails