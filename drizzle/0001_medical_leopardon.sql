CREATE TABLE `quizResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mode` varchar(50) NOT NULL DEFAULT 'normal',
	`selectedCategories` text,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`categoryResults` text,
	`wrongQuestionIds` text,
	`timeSpent` int,
	`completedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizResults_id` PRIMARY KEY(`id`)
);
