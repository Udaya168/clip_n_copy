import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const productsDir = path.resolve("public/products");

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/\.(webp|jpg|jpeg|png)$/i, "")
        .replace(/[_-]+/g, " ")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getImageFiles() {
    return fs
        .readdirSync(productsDir)
        .filter((file) => /\.(webp|jpg|jpeg|png)$/i.test(file));
}

function scoreMatch(productName, fileName) {
    const product = normalize(productName);
    const file = normalize(fileName);

    if (product === file) return 100;

    const productWords = product.split(" ").filter(Boolean);
    const fileWords = file.split(" ").filter(Boolean);

    let matched = 0;

    for (const word of productWords) {
        if (word.length >= 3 && fileWords.includes(word)) {
            matched++;
        }
    }

    if (!matched) return 0;

    return Math.round((matched / productWords.length) * 100);
}

async function main() {
    console.log("Fetching products without images...\n");

    const { data: products, error } = await supabase
        .from("products")
        .select("id, name, category, brand, image_url")
        .is("image_url", null);

    if (error) {
        console.error("Supabase error:", error);
        process.exit(1);
    }

    const imageFiles = getImageFiles();

    console.log(`Products without images: ${products.length}`);
    console.log(`Available images: ${imageFiles.length}\n`);

    let matched = 0;
    let unmatched = 0;

    for (const product of products) {
        const candidates = imageFiles
            .map((file) => ({
                file,
                score: scoreMatch(product.name, file),
            }))
            .filter((item) => item.score >= 70)
            .sort((a, b) => b.score - a.score);

        console.log("----------------------------------------");
        console.log(`PRODUCT: ${product.name}`);
        console.log(`CATEGORY: ${product.category}`);
        console.log(`BRAND: ${product.brand}`);

        if (candidates.length === 0) {
            console.log("❌ NO MATCH");
            unmatched++;
            continue;
        }

        const best = candidates[0];

        // Only automatically assign a strong unique match.
        const second = candidates[1];

        if (best.score === 100 || (best.score >= 80 && (!second || best.score > second.score))) {
            const imageUrl = `/products/${best.file}`;

            const { error: updateError } = await supabase
                .from("products")
                .update({ image_url: imageUrl })
                .eq("id", product.id);

            if (updateError) {
                console.log(`❌ UPDATE FAILED: ${updateError.message}`);
                unmatched++;
            } else {
                console.log(`✅ MATCHED: ${best.file} (${best.score}%)`);
                matched++;
            }
        } else {
            console.log("⚠️ AMBIGUOUS MATCH - NOT UPDATED");

            candidates.slice(0, 5).forEach((candidate, index) => {
                console.log(
                    `${index + 1}. ${candidate.file} (${candidate.score}%)`
                );
            });

            unmatched++;
        }
    }

    console.log("\n========================================");
    console.log(`✅ Updated: ${matched}`);
    console.log(`❌ Remaining: ${unmatched}`);
    console.log("========================================\n");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});