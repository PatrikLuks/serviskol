
import sys
import os
from datetime import datetime
from openai import OpenAI

# Usage: python promptuj.py [zadani.txt] [prompt.txt] [output.md]
# Default: 00_plan.txt 02_ai_prompts/pracuj_strategicky.txt 03_ai_outputs/vystup_YYMMDD_HHMM.md

def read_file(path):
    with open(path, "r") as f:
        return f.read()

def main():
    zadani = sys.argv[1] if len(sys.argv) > 1 else "00_plan.txt"
    prompt_file = sys.argv[2] if len(sys.argv) > 2 else "02_ai_prompts/pracuj_strategicky.txt"
    output_file = sys.argv[3] if len(sys.argv) > 3 else f"03_ai_outputs/vystup_{datetime.now().strftime('%y%m%d_%H%M')}.md"

    plan = read_file(zadani)
    prompt = read_file(prompt_file)

    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Jsi inteligentní asistent."},
            {"role": "user", "content": f"{prompt}\n\nZadání:\n{plan}"}
        ]
    )
    result = completion.choices[0].message.content
    print(result)
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w") as f:
        f.write(result)
    print(f"Výstup uložen do {output_file}")

if __name__ == "__main__":
    main()
