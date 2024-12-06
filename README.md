# CV parse and Udemy video recommendation

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)]()
[![Maintaner](https://img.shields.io/static/v1?label=Oleksandr%20Samoilenko&message=Maintainer&color=red)](mailto:oleksandr.samoilenko@extrawest.com)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)]()
![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)
![GitHub release](https://img.shields.io/badge/release-v1.0.0-blue)

## PROJECT INFO

- **Flutter app designed to parse CVs show candidate skillset and recommend Udemy courses**
- **The app allows you to upload .pdf, .docx and .csv CV and gives brief summary of Seniority level,
  Developer role and skillset. Udemy dataset is used to allow you to search for Udemy courses to
  level up your knowledge or help you learn another technology**

## Features

- OpenAI client for GPT-3.5 and GPT-4
- OpenAI embeddings for GPT-3.5 and GPT-4
- Pinecone vector database
- Langgraph multiagent
- Kaggle Udemy dataset https://www.kaggle.com/datasets/yusufdelikkaya/udemy-online-education-courses

## Preview

1. Upload and Summarize CV


https://github.com/user-attachments/assets/a1dc2abb-0f20-4ff4-9ad4-28279d9ef13e


2. Courses Recommendation


https://github.com/user-attachments/assets/23203225-cfca-4818-bc2e-53122b715c98


## Installing:

**1. Clone this repo to your folder:**

```
git clone https://gitlab.extrawest.com/i-training/flutter/udemy-course-recommended-system
```

**2. Change current directory to the cloned folder:**

```
cd udemy-course-recommended-system/mobile
```

**3. Get packages**

```
flutter pub get
```

## Setup Server

**1. Open server folder:**

```
cd udemy-course-recommended-system/server
```

**2. In the root of server file create .env file and add the following variables:**

```
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
PINECONE_API_KEY = 'YOUR_PINECONE_API_KEY'
PINECONE_INDEX_NAME = "YOUR_PINECONE_INDEX_NAME" // for cv vector store
PINECONE_DATASOURCE_INDEX_NAME = "YOUR_DATASOURCE_INDEX_NAME"  // for udemy vector store
```

**3. Upload Udemy dataset to Pinecone:**
Go to `tools` folder, open `datasource_upload_tool.js` file, change csvFilePath to your Udemy dataset path, you also can use one from the project. In the root folder you can find `udemy_online_education_courses_dataset.csv` file. 
To upload the dataset run `node datasource_upload_tool.js`. It can take a while.

**4. Run server:**
To start server, just run `npx tsx server.ts`.

**2. Change server path in flutter project:**
Go to app/lib/services/api_service.dart and change the baseUrl to your server path

Now you can use the app

Created by Oleksandr Samoilenko

[Extrawest.com](https://www.extrawest.com), 2024

