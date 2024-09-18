const bookMarksPrompt = `
As a web data parsing assistant, I will provide you with a piece of Markdown-formatted web data. Please return multi-dimensional classification and tagging information in JSON format, including URL, title, description, author, created date, last updated date, language, and keywords. Please translate all content into {Chinese}, and also retain the original language content in the results. Ensure that the generated data structure is suitable for quick search and web management. **Note**: Only return JSON data, do not include any extra data. After I provide you with the data, complete the task according to the following steps:

### Steps:

1. **Parse the Markdown content**: Extract information such as title, description, author, created date, last updated date, language, and keywords. If the Markdown content redirects to a login page, shows a 404 error, or is incomplete, please record the corresponding status information accordingly. If a primary language is specified, please translate all fields and retain the original language content.

2. **Create multi-dimensional classifications**: Create multi-dimensional classifications based on the extracted information, ensuring that each dimension has clear and unique classification standards, such as theme, type, and difficulty.

3. **Generate JSON format data**: Use the extracted information to generate data in JSON format, ensuring that each entry includes the following fields:

   - **URL**: The URL address of the web page (null field).
   - **Title**: The title of the web page, including the original language and {Chinese} translation version.
   - **Description**: A brief description of the web page content, including the original language and {Chinese} translation version.
   - **Author**: The author or publisher of the web content.
   - **Created Date**: The date the web page was created.
   - **Last Updated Date**: The date the web page was last updated.
   - **Keywords**: An array of keywords related to the web page, for easy searching, including the original language and {Chinese} translation version.
   - **Categories**: Multi-dimensional classification tags (such as theme, type, difficulty, etc.), including the original language and {Chinese} translation version.
   - **Tags**: Custom tags for more detailed screening and filtering, including the original language and {Chinese} translation version.
   - **Source**: The source website of the web content.
   - **Reading Time**: The estimated time required to read the web content.
   - **Type**: The type of content (such as article, video, tutorial, etc.), including the original language and {Chinese} translation version.
   - **Language**: The language of the content (e.g., Chinese, English).
   - **Status**: The current status of the web page, such as \`"success"\`,\`"requires_login"\`,\`"404_not_found"\`,\`"network_error"\`,\`"is_down"\`,\`"other"\` etc.
   - **Error Message**: When an error occurs, provide specific error information for debugging and handling.
   - **Redirect URL**: If the page has a redirect, provide the redirected URL address.
   - **Is Complete**: A boolean value indicating whether the content is complete.

### JSON Structure Example:

\`\`\`json
{
    "url": null,
    "title": {
        "original": "Article Title",
        "translated": "文章标题"
    },
    "description": {
        "original": "This is a detailed tutorial on how to use APIs.",
        "translated": "这是一篇关于如何使用API的详细教程。"
    },
    "author": "Author Name",
    "created_date": "2023-08-01",
    "last_updated_date": "2023-09-01",
    "keywords": {
        "original": ["API", "Tutorial", "Development"],
        "translated": ["API", "教程", "开发"]
    },
    "categories": {
        "original": {
            "theme": "Development",
            "type": "Tutorial",
            "difficulty": "Beginner"
        },
        "translated": {
            "theme": "开发",
            "type": "教程",
            "difficulty": "初学者"
        }
    },
    "tags": {
        "original": ["API", "Beginner", "Web Development"],
        "translated": ["API", "初学者", "Web开发"]
    },
    "source": "https://gist.github.com/evilpan/851b95e40a8",
    "reading_time": "5 minutes",
    "type": {
        "original": "Tutorial",
        "translated": "教程"
    },
    "language": "English",
    "status": "success",
    "error_message": null,
    "redirect_url": null,
    "is_complete": true
}
\`\`\`
`.trim()


const githubStarPrompt = `
As a GitHub project analysis assistant, I will provide you with Markdown-formatted GitHub Star project data. Please return multi-dimensional classification and tagging information in JSON format, including URL, project name, project description, project author, created date, last updated date, language, number of stars, number of forks, license type, project status (active or archived), main contributors, release information, etc. Please translate all content into {Chinese}, and also retain the original language content in the results. Ensure that the generated data structure is suitable for quick search, project management, and analysis. **Note**: Only return JSON data, do not include any extra data. After I provide you with the data, complete the task according to the following steps:

### Steps:

1. **Parse the Markdown content**: Extract information such as project name, description, author, created date, last updated date, language, number of stars, number of forks, license type, main contributors, release information, etc. If a primary language is specified, please translate all fields and retain the original language content.

2. **Create multi-dimensional classifications**: Create multi-dimensional classifications based on the extracted information, ensuring that each dimension has clear and unique classification standards, such as project category (tool, library, framework, etc.), theme, difficulty, tech stack, etc.

3. **Generate JSON format data**: Use the extracted information to generate data in JSON format, ensuring that each entry includes the following fields:

   - **URL**: The GitHub project's URL address.
   - **Project Name**: The project name, including the original language and {Chinese} translation version.
   - **Description**: A brief description of the project content, including the original language and {Chinese} translation version.
   - **Author**: The project author or publisher.
   - **Created Date**: The date the project was created.
   - **Last Updated Date**: The date the project was last updated.
   - **Stars**: The number of stars the project has.
   - **Forks**: The number of forks the project has.
   - **License**: The project's license type (e.g., MIT, Apache 2.0, etc.).
   - **Languages**: The programming languages used in the project.
   - **Keywords**: An array of keywords related to the project, for easy searching, including the original language and {Chinese} translation version.
   - **Categories**: Multi-dimensional classification tags (such as project type, theme, tech stack, difficulty, etc.), including the original language and {Chinese} translation version.
   - **Tags**: Custom tags for more detailed screening and filtering, including the original language and {Chinese} translation version.
   - **Contributors**: A list of the main contributors to the project.
   - **Project Status**: The current status of the project (active or archived).
   - **Releases**: The project's release information, including the number of releases and release details.
   - **Development Stage**: The development stage of the project (e.g., Alpha, Beta, Production-ready), including the original language and {Chinese} translation version.

### JSON Structure Example:

\`\`\`json
{
    "url": "https://github.com/onhexgroup/Conferences",
    "project_name": {
        "original": "Conferences",
        "translated": "会议"
    },
    "description": {
        "original": "Conference presentation slides",
        "translated": "会议演示文稿"
    },
    "author": "onhexgroup",
    "created_date": "2023-05-16",
    "last_updated_date": "2024-08-10",
    "stars": 1400,
    "forks": 235,
    "license": "MIT",
    "languages": ["Python", "Markdown"],
    "keywords": {
        "original": ["conferences", "slides", "presentation"],
        "translated": ["会议", "幻灯片", "演示"]
    },
    "categories": {
        "original": {
            "type": "Tool",
            "theme": "Security",
            "tech_stack": "Python",
            "difficulty": "Intermediate"
        },
        "translated": {
            "类型": "工具",
            "主题": "安全",
            "技术栈": "Python",
            "难度": "中级"
        }
    },
    "tags": {
        "original": ["presentation", "security", "blackhat"],
        "translated": ["演示", "安全", "黑帽"]
    },
    "contributors": ["onhexgroup"],
    "project_status": "active",
    "releases": {
        "release_count": 5,
        "latest_release": "v1.5.0",
        "release_notes": "Added the latest conference slides"
    },
    "development_stage": {
        "original": "Production-ready",
        "translated": "稳定版"
    }
}
\`\`\`
`.trim()

const getLocalizedGithubStarPrompt = (language: string): string => {
    return githubStarPrompt.replace(/\{Chinese\}/g, language);
}

const getLocalizedBookMarksPrompt = (language: string): string => {
    return bookMarksPrompt.replace(/\{Chinese\}/g, language);
}

export { githubStarPrompt, bookMarksPrompt, getLocalizedGithubStarPrompt, getLocalizedBookMarksPrompt }
