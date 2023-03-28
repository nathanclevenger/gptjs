import fs from 'fs'
import figlet from 'figlet'
import slugify from 'slugify'
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import { openai } from '../utils/gpt.js'
import { createToc } from '../utils/toc.js'
import { isNext } from '../utils/utils.js'

export const configBook = program => {
  program.command('react-component')
    .description('Book')
    .argument('[topic]', 'What topic do you want to discuss?', 'How to write a book')
    .option('-c, --chapters <number>', 'the number of Chapters in the book', '20')
    .option('-w, --words <words>', 'How many words should be generated per chapter?', '2000')
    .option('-o, --output <path>', 'What path should the content be output?', isNext ? path.join('pages/posts') : '_posts')
    .action((str, options) => args = { contentType: 'Book', topic: str, ...options })
}

export const generateBook = async ({chapters, number, topic, output, words}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.'},
          {'role': 'user', 'content': `Respond with a list of ${number} possible titles of ${contentType} for the topic "${topic}". Do not count the items in the list.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content

  const items = createToc({topic, content, output})

  const contentSpinner = createSpinner('Asking GPT to generate content for each topic ...').start()

  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format that starts with title `# `'},
            {'role': 'user', 'content': `Respond with a ${words} word blog post on the topic "${item}" which will be posted on a blog about ${topic}.`},
        ]
      }).then(itemResponse => {
        const itemContent = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`${output}/${slugify(item, { strict: true })}.md`, itemContent)
  })}))

  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})

  console.log(gradient.pastel.multiline(figlet.textSync('Success!')))

}