export type Book = {
  title: string;
};

export type LibraryYear = {
  year: number;
  books: Book[];
};

export const library: LibraryYear[] = [
  {
    year: 2026,
    books: [
      { title: "Mindset: The New Psychology of Success" },
      { title: "The Hard Thing About Hard Things" },
    ],
  },
  {
    year: 2025,
    books: [
      { title: "Chapterhouse: Dune" },
      { title: "Heretics of Dune" },
      { title: "God Emperor of Dune" },
      { title: "Children of Dune" },
      { title: "Dune Messiah" },
      { title: "Dune" },
    ],
  },
  {
    year: 2024,
    books: [
      { title: "Atomic Habits" },
      { title: "Distributed Services with Go" },
      { title: "Concurrency in Go" },
      {
        title: "Writing an Interpreter in Go",
      },
      {
        title: "Writing a Compiler in Go",
      },
    ],
  },
];
