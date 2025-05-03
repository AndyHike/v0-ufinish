const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const glob = require("glob")

// Конфігурація
const config = {
  inputDir: "public",
  outputFormats: ["webp", "avif"],
  quality: 80,
  sizes: [640, 1080, 1920], // Розміри для адаптивних зображень
}

// Функція для оптимізації зображення
async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase()
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif"]

  // Пропускаємо вже оптимізовані зображення та невалідні формати
  if (!validExtensions.includes(ext) || inputPath.includes(".optimized.")) {
    return
  }

  const filename = path.basename(inputPath, ext)
  const directory = path.dirname(inputPath)

  try {
    // Завантажуємо зображення
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    // Створюємо оптимізовані версії
    for (const format of config.outputFormats) {
      // Оригінальний розмір
      await image
        .toFormat(format, { quality: config.quality })
        .toFile(path.join(directory, `${filename}.optimized.${format}`))

      // Адаптивні розміри
      for (const size of config.sizes) {
        // Пропускаємо розміри більші за оригінал
        if (size >= metadata.width) continue

        await image
          .resize(size)
          .toFormat(format, { quality: config.quality })
          .toFile(path.join(directory, `${filename}.optimized.${size}.${format}`))
      }
    }

    console.log(`✅ Оптимізовано: ${inputPath}`)
  } catch (error) {
    console.error(`❌ Помилка оптимізації ${inputPath}:`, error)
  }
}

// Знаходимо всі зображення
glob(`${config.inputDir}/**/*.{jpg,jpeg,png,gif}`, async (err, files) => {
  if (err) {
    console.error("Помилка пошуку файлів:", err)
    return
  }

  console.log(`Знайдено ${files.length} зображень для оптимізації...`)

  // Оптимізуємо кожне зображення
  for (const file of files) {
    await optimizeImage(file)
  }

  console.log("Оптимізація завершена!")
})
