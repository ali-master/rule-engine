import { it, expect, describe } from "vitest";

import {
  selfContainsAnyOperator,
  selfContainsAllOperator,
  RuleEngine,
  Operators,
  matchesOperator,
  likeOperator,
  lessThanOrEqualsOperator,
  lessThanOperator,
  isZeroOperator,
  isUuidOperator,
  isUrlOperator,
  isUpperCaseOperator,
  isTruthyOperator,
  isTimeEqualsOperator,
  isTimeBetweenOperator,
  isTimeBeforeOrEqualsOperator,
  isTimeBeforeOperator,
  isTimeAfterOrEqualsOperator,
  isTimeAfterOperator,
  isStringOperator,
  isPositiveOperator,
  isPersianAlphaOperator,
  isPersianAlphaNumericOperator,
  isObjectOperator,
  isNumericOperator,
  isNumberOperator,
  isNumberBetweenOperator,
  isNullOrWhiteSpaceOperator,
  isNullOrUndefinedOperator,
  isNegativeOperator,
  isMinOperator,
  isMinLengthOperator,
  isMaxOperator,
  isMaxLengthOperator,
  isLowerCaseOperator,
  isLengthOperator,
  IsLengthBetweenOperator,
  isIntegerOperator,
  isFloatOperator,
  isFalsyOperator,
  isExistsInObjectOperator,
  isEmptyOperator,
  isEmailOperator,
  isDateOperator,
  isDateEqualsOperator,
  isDateBetweenOperator,
  isDateBeforeOrEqualsOperator,
  isDateBeforeOperator,
  isDateAfterOrEqualsOperator,
  isDateAfterOperator,
  isBooleanStringOperator,
  isBooleanOperator,
  isBooleanNumberStringOperator,
  isBooleanNumberOperator,
  isBetweenOperator,
  isArrayOperator,
  isAlphaOperator,
  isAlphaNumericOperator,
  inOperator,
  greaterThanOrEqualsOperator,
  greaterThanOperator,
  equalsOperator,
  containsOperator,
  containsAnyOperator,
  containsAllOperator,
} from "@root";

describe("rule Engine Evaluation Operators", () => {
  ///////////////////////////
  // :: LIKE OPERATOR :: //
  ///////////////////////////
  describe("likeOperator", () => {
    describe("likeOperator function", () => {
      it("should match a simple pattern with wildcards", () => {
        const text = "This is a simple string";
        const pattern = "%simple%";
        expect(likeOperator(text, pattern)).toBeTruthy();
      });
      it("should match a simple pattern with wildcards 2", () => {
        const text = "@Aa101010";
        const pattern = "^@A%";
        expect(likeOperator(text, pattern)).toBeTruthy();
      });
      it("should match a pattern with a wildcard at the beginning", () => {
        const text = "This is a simple string";
        const pattern = "%This%";
        expect(likeOperator(text, pattern)).toBeTruthy();
      });

      it("should match a pattern with a wildcard at the end", () => {
        const text = "This is a simple string";
        const pattern = "%string";
        expect(likeOperator(text, pattern)).toBeTruthy();
      });

      it("should match a pattern with a wildcard at the beginning and end", () => {
        const text = "This is a simple string";
        const pattern = "%is a simple%";
        expect(likeOperator(text, pattern)).toBeTruthy();
      });

      /**
       * text = "abc_x_defg" => pattern = "abc_de_%" => true
       * text = "abc_y_123" => pattern = "abc_de_%" => false
       * text = "abc_def" => pattern = "abc_de_%" => true
       * text = "abc_defg" => pattern = "abc_de_%" => true
       * text = "abc_de_defg" => pattern = "abc_de_%g" => true
       * text = "abc_y_123" => pattern = "abc_de_%g" => false
       */
      it("should match a pattern with an underscore character set", () => {
        const text = "abc_x_defg";
        const pattern = "abc_de_%";
        expect(likeOperator(text, pattern)).toBeFalsy();

        const text2 = "abc_y_123";
        const pattern2 = "abc_de_%";
        expect(likeOperator(text2, pattern2)).toBeFalsy();

        const text3 = "abc_def";
        const pattern3 = "abc_de_%";
        expect(likeOperator(text3, pattern3)).toBeTruthy();

        const text4 = "abc_defg";
        const pattern4 = "abc_de_%";
        expect(likeOperator(text4, pattern4)).toBeTruthy();

        const text5 = "abc_x_defg";
        const pattern5 = "abc_de_%g";
        expect(likeOperator(text5, pattern5)).toBeFalsy();

        const text6 = "abc_y_123";
        const pattern6 = "abc_de_%g";
        expect(likeOperator(text6, pattern6)).toBeFalsy();
      });

      /**
       * text = "a_def" => pattern = "[a-c]_%" => true
       * text = "b_ghi" => pattern = "[a-c]_%" => true
       * text = "c_jkl" => pattern = "[a-c]_%" => true
       * text = "d_mno" => pattern = "[a-c]_%" => false
       */
      it("should match a pattern with a character set", () => {
        const text = "a_def";
        const pattern = "[a-c]_%";
        expect(likeOperator(text, pattern)).toBeTruthy();

        const text2 = "b_ghi";
        const pattern2 = "[a-c]_%";
        expect(likeOperator(text2, pattern2)).toBeTruthy();

        const text3 = "c_jkl";
        const pattern3 = "[a-c]_%";
        expect(likeOperator(text3, pattern3)).toBeTruthy();

        const text4 = "d_mno";
        const pattern4 = "[a-c]_%";
        expect(likeOperator(text4, pattern4)).toBeFalsy();
      });

      /**
       * text = "x_def" => pattern = "[^aeiou]_%" => true
       * text = "z_ghi" => pattern = "[^aeiou]_%" => true
       * text = "a_jkl" => pattern = "[^aeiou]_%" => false
       * text = "e_mno" => pattern = "[^aeiou]_%" => false
       */
      it("should match a pattern with a character set range", () => {
        const text = "x_def";
        const pattern = "[^aeiou]_%";
        expect(likeOperator(text, pattern)).toBeTruthy();

        const text2 = "z_ghi";
        const pattern2 = "[^aeiou]_%";
        expect(likeOperator(text2, pattern2)).toBeTruthy();

        const text3 = "a_jkl";
        const pattern3 = "[^aeiou]_%";
        expect(likeOperator(text3, pattern3)).toBeFalsy();

        const text4 = "e_mno";
        const pattern4 = "[^aeiou]_%";
        expect(likeOperator(text4, pattern4)).toBeFalsy();
      });

      /**
       * text = "This is an example string" => pattern = "The\%is is an exa\%ple str%ng" => true
       * text = "This is an example string" => pattern = "The\%is is an exa%ple str%ng" => true
       * text = "This is an example string" => pattern = "The\%is is an exa\%ple str%ng" => true
       */
      it("should handle escaped special characters", () => {
        const text = "This is an example string";
        const pattern = "Th%is is an exa%ple str%ng";
        expect(likeOperator(text, pattern)).toBeTruthy();

        const text2 = "This is an example string";
        const pattern2 = "Th%is is an exa%ple str%ng";
        expect(likeOperator(text2, pattern2)).toBeTruthy();

        const text3 = "This is an example string";
        const pattern3 = "Th%is is an exa%ple str%ng";
        expect(likeOperator(text3, pattern3)).toBeTruthy();
      });

      /**
       * text = "myfile.txt" => pattern = "%.txt" => true
       * text = "document.txt" => pattern = "%.txt" => true
       * text = "image.jpg" => pattern = "%.txt" => false
       * text = "myfile.txt" => pattern = "myfile.%" => true
       * text = "myfile.txt" => pattern = "myfile.txt%" => true
       * text = "myfile.txt" => pattern = "myfile.txt" => true
       */
      it("should match a pattern with a wildcard character", () => {
        const text = "myfile.txt";
        const pattern = "%.txt";
        expect(likeOperator(text, pattern)).toBeTruthy();

        const text2 = "document.txt";
        const pattern2 = "%.txt";
        expect(likeOperator(text2, pattern2)).toBeTruthy();

        const text3 = "image.jpg";
        const pattern3 = "%.txt";
        expect(likeOperator(text3, pattern3)).toBeFalsy();

        const text4 = "myfile.txt";
        const pattern4 = "myfile.%";
        expect(likeOperator(text4, pattern4)).toBeTruthy();

        const text5 = "myfile.txt";
        const pattern5 = "myfile.txt%";
        expect(likeOperator(text5, pattern5)).toBeTruthy();

        const text6 = "myfile.txt";
        const pattern6 = "myfile.txt";
        expect(likeOperator(text6, pattern6)).toBeTruthy();
      });

      it("should not match if the pattern is not present", () => {
        const text = "This is a different string";
        const pattern = "%manager%";
        expect(likeOperator(text, pattern)).toBeFalsy();
      });

      it("should handle empty pattern", () => {
        const text = "Any string";
        const pattern = "";
        expect(likeOperator(text, pattern)).toBeFalsy();
      });

      it("should handle empty text", () => {
        const text = "";
        const pattern = "%any%";
        expect(likeOperator(text, pattern)).toBeFalsy();
      });

      it("should not match if the underscore is not part of the pattern", () => {
        const text = "helloworld";
        const pattern = "hello_";
        expect(likeOperator(text, pattern)).toBeFalsy();
      });

      it("should handle escaped special characters outside character sets", () => {
        const text = "special_chars";
        const pattern = "\\$\\&";
        expect(likeOperator(text, pattern)).toBeFalsy();
      });

      it("should handle * wildcard", () => {
        const text = "This is a simple string";
        const pattern = "simple*";
        expect(likeOperator(text, pattern)).toBeFalsy();

        const text2 = "This is a simple string";
        const pattern2 = "*simple*";
        expect(likeOperator(text2, pattern2)).toBeFalsy();

        const text3 = "This is a simple string";
        const pattern3 = "*simple";
        expect(likeOperator(text3, pattern3)).toBeFalsy();

        const text4 = "This is a simple string";
        const pattern4 = "sim*ple";
        expect(likeOperator(text4, pattern4)).toBeFalsy();
      });

      it("should handle ? ! ^ $ wildcards", () => {
        const text = "This is a simple string";
        const pattern = "simple?";
        expect(likeOperator(text, pattern)).toBeFalsy();

        const text2 = "This is a simple string";
        const pattern2 = "!simple!";
        expect(likeOperator(text2, pattern2)).toBeFalsy();

        const text3 = "This is a simple string";
        const pattern3 = "^simple";
        expect(likeOperator(text3, pattern3)).toBeFalsy();

        const text4 = "This is a simple string";
        const pattern4 = "simple^";
        expect(likeOperator(text4, pattern4)).toBeFalsy();

        const text5 = "This is a simple string";
        const pattern5 = "simple$";
        expect(likeOperator(text5, pattern5)).toBeFalsy();
      });
    });

    describe("ruleEngine Like Operator", () => {
      it("should match a simple pattern with wildcards", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Like, value: "%simple%" },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "This is a complex string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should match a pattern with a wildcard at the beginning", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.Like, value: "%This%" }],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should match a pattern with a wildcard at the end", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Like, value: "%string" },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "This is a simple" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should match a pattern with a wildcard at the beginning and end", async () => {
        const conditions = [
          {
            and: [
              {
                field: "text",
                operator: Operators.Like,
                value: "%is a simple%",
              },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "This is a string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should match a pattern with an underscore character set", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Like, value: "abc_de_%" },
            ],
          },
        ];
        const data = { text: "abc_x_defg" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();

        const data2 = { text: "abc_y_123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { text: "abc_def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { text: "abc_defg" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();

        const data5 = { text: "abc_x_defg" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeFalsy();

        const data6 = { text: "abc_y_123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data6),
        ).toBeFalsy();
      });

      it("should match a pattern with a character set", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Like, value: "[a-c]_%" },
            ],
          },
        ];
        const data = { text: "a_def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "b_ghi" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { text: "c_jkl" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { text: "d_mno" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });

      it("should match a pattern with a character set range", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Like, value: "[^aeiou]_%" },
            ],
          },
        ];
        const data = { text: "x_def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "z_ghi" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { text: "a_jkl" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { text: "e_mno" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });

      it("should handle escaped special characters", async () => {
        const conditions = [
          {
            and: [
              {
                field: "text",
                operator: Operators.Like,
                value: "Th%is is an exa%ple str%ng",
              },
            ],
          },
        ];
        const data = { text: "This is an example string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "This is an example string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { text: "This is an example string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should match a pattern with a wildcard character", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.Like, value: "%.txt" }],
          },
        ];
        const data = { text: "myfile.txt" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: "document.txt" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { text: "image.jpg" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { text: "myfile.txt" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();

        const data5 = { text: "myfile.txt" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeTruthy();

        const data6 = { text: "myfile.txt" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data6),
        ).toBeTruthy();
      });
    });
  });

  ///////////////////////////
  // :: REGEXP OPERATOR :: //
  ///////////////////////////
  describe("matches Operator", () => {
    it("should match a simple pattern", () => {
      const text = "This is a simple string";
      const pattern = "simple";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });
    it("should match a pattern with a wildcard", () => {
      const text = "This is a simple string";
      const pattern = "simple.*";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });
    it("should match a pattern with a character set", () => {
      const text = "This is a simple string";
      const pattern = "simple [a-z]";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should match a pattern with a character set range", () => {
      const text = "This is a simple string";
      const pattern = "simple [a-z]";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should match a pattern with at least one uppercase char", () => {
      const text = "This is a simple string";
      const pattern = "^(?=.*?[A-Z]).*$";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should match a pattern with at least one lowercase char", () => {
      const text = "This is a simple string";
      const pattern = "^(?=.*?[a-z]).*$";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should match a pattern with at least one digit", () => {
      const text = "This is 1 simple string";
      const pattern = "^(?=.*?[0-9]).*$";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should match a pattern with at least one special char", () => {
      const text = "This is a simple string";
      const pattern = "^(?=.*?[#?!@$%^&*-]).*$";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    it("should handle escaped special characters", () => {
      const text = "This is an example string";
      const pattern = "Th%is is an exa%ple str%ng";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    it("should match a pattern with a wildcard character", () => {
      const text = "myfile.txt";
      const pattern = ".txt$";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    it("should not match if the pattern is not present", () => {
      const text = "This is a different string";
      const pattern = "manager";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    it("should handle empty pattern", () => {
      const text = "Any string";
      const pattern = "";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    it("should handle empty text", () => {
      const text = "";
      const pattern = "any";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    it("should not match if the underscore is not part of the pattern", () => {
      const text = "helloworld";
      const pattern = "hello_";
      expect(matchesOperator(text, pattern)).toBeFalsy();
    });

    // check Email regex
    it("should match a valid email", () => {
      const text = "test@gmail.com";
      const pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
      expect(matchesOperator(text, pattern)).toBeTruthy();
    });

    describe("ruleEngine Matches Operator", () => {
      it("should match a simple pattern", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Matches, value: "simple" },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should match a pattern with a wildcard", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Matches, value: "simple.*" },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should match a pattern with a character set", async () => {
        const conditions = [
          {
            and: [
              {
                field: "text",
                operator: Operators.Matches,
                value: "simple [a-z]",
              },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should match a pattern with a character set range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "text",
                operator: Operators.Matches,
                value: "simple [a-z]",
              },
            ],
          },
        ];
        const data = { text: "This is a simple string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should not match if the pattern is not present", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Matches, value: "manager" },
            ],
          },
        ];
        const data = { text: "This is a different string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should handle empty pattern", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.Matches, value: "" }],
          },
        ];
        const data = { text: "Any string" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should handle empty text", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.Matches, value: "any" }],
          },
        ];
        const data = { text: "" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should not match if the underscore is not part of the pattern", async () => {
        const conditions = [
          {
            and: [
              { field: "text", operator: Operators.Matches, value: "hello_" },
            ],
          },
        ];
        const data = { text: "helloworld" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
      // check Email regex
      it("should match a valid email", async () => {
        const conditions = [
          {
            and: [
              {
                field: "email",
                operator: Operators.Matches,
                value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              },
            ],
          },
        ];
        const data = { email: "test@gmail.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { email: "test@gmail" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { email: "testgmail.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { email: "test@gmail." };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });

      // check URL regex
      it("should match a valid URL", async () => {
        const conditions = [
          {
            and: [
              {
                field: "url",
                operator: Operators.Matches,
                value:
                  "/(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,})/",
              },
            ],
          },
        ];
        const data = { url: "https://www.google.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { url: "http://www.google.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { url: "http://www.google" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { url: "https://www.google." };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NULL OR WHITE SPACE OPERATOR :: //
  ///////////////////////////
  describe("isNullOrWhiteSpaceOperator", () => {
    it("should return true for null", () => {
      const text = null;
      expect(
        isNullOrWhiteSpaceOperator(text as unknown as string),
      ).toBeTruthy();
    });

    it("should return true for undefined", () => {
      const text = undefined;
      expect(
        isNullOrWhiteSpaceOperator(text as unknown as string),
      ).toBeTruthy();
    });

    it("should return true for empty string", () => {
      const text = "";
      expect(isNullOrWhiteSpaceOperator(text)).toBeTruthy();
    });

    it("should return true for white space", () => {
      const text = " ";
      expect(isNullOrWhiteSpaceOperator(text)).toBeTruthy();
    });

    it("should return false for a string with content", () => {
      const text = "Some text";
      expect(isNullOrWhiteSpaceOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isNullOrWhiteSpace Operator", () => {
      it("should return true for null", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.NullOrWhiteSpace }],
          },
        ];
        const data = { text: null };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { text: undefined };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { text: "" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { text: " " };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();
      });

      it("should return false for a string with content", async () => {
        const conditions = [
          {
            and: [{ field: "text", operator: Operators.NullOrWhiteSpace }],
          },
        ];
        const data = { text: "Some text" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NUMERIC OPERATOR :: //
  ///////////////////////////
  describe("isNumericOperator", () => {
    it("should return true for a number", () => {
      const text = "123";
      expect(isNumericOperator(text)).toBeTruthy();
    });
    it("should return true for a negative number", () => {
      const text = "-123";
      expect(isNumericOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isNumericOperator(text)).toBeFalsy();
    });
    it("should return false for a string with numbers", () => {
      const text = "abc123";
      expect(isNumericOperator(text)).toBeFalsy();
    });
    it("should return false for a string with numbers and special characters", () => {
      const text = "abc123$";
      expect(isNumericOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isNumeric Operator", () => {
      it("should return true for a number", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Numeric }],
          },
        ];
        const data = { number: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { number: "-123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Numeric }],
          },
        ];
        const data = { number: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string with numbers", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Numeric }],
          },
        ];
        const data = { number: "abc123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string with numbers and special characters", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Numeric }],
          },
        ];
        const data = { number: "abc123$" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BOOLEAN OPERATOR :: //
  ///////////////////////////
  describe("isBooleanOperator", () => {
    it("should return true for true", () => {
      const inp = true;
      expect(isBooleanOperator(inp)).toBeTruthy();
    });
    it("should return true for false", () => {
      const inp = false;
      expect(isBooleanOperator(inp)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isBooleanOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isBooleanOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains false as string", () => {
      const text = "true";
      expect(isBooleanOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains true as string", () => {
      const text = "false";
      expect(isBooleanOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isBoolean Operator", () => {
      it("should return true for true", async () => {
        const conditions = [
          {
            and: [{ field: "bool", operator: Operators.Boolean }],
          },
        ];
        const data = { bool: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { bool: false };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "bool", operator: Operators.Boolean }],
          },
        ];
        const data = { bool: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "bool", operator: Operators.Boolean }],
          },
        ];
        const data = { bool: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string contains false as string", async () => {
        const conditions = [
          {
            and: [{ field: "bool", operator: Operators.Boolean }],
          },
        ];
        const data = { bool: "true" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE OPERATOR :: //
  ///////////////////////////

  describe("isDateOperator", () => {
    it("should return true for a date string", () => {
      const text = "2020-01-01";
      expect(isDateOperator(text)).toBeTruthy();
    });
    it("should return true for a date string with time", () => {
      const text = "2020-01-01T00:00:00";
      expect(isDateOperator(text)).toBeTruthy();
    });
    it("should return true for a number(God damn it)", () => {
      const text = "123";
      expect(isDateOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isDateOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains date as string", () => {
      const text = "date";
      expect(isDateOperator(text)).toBeFalsy();

      const text2 = "time";
      expect(isDateOperator(text2)).toBeFalsy();
    });

    describe("ruleEngine isDate Operator", () => {
      it("should return true for a date string", async () => {
        const conditions = [
          {
            and: [{ field: "date", operator: Operators.Date }],
          },
        ];
        const data = { date: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { date: "2020-01-01T00:00:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { date: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "date", operator: Operators.Date }],
          },
        ];
        const data4 = { date: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();

        const data5 = { date: "date" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS EMAIL OPERATOR :: //
  ///////////////////////////

  describe("isEmailOperator", () => {
    it("should return true for a valid email", () => {
      const text = "test@gmail.com";
      expect(isEmailOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isEmailOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isEmailOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains email as string", () => {
      const text = "email";
      expect(isEmailOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isEmail Operator", () => {
      it("should return true for a valid email", async () => {
        const conditions = [
          {
            and: [{ field: "email", operator: Operators.Email }],
          },
        ];
        const data = { email: "test@gmail.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "email", operator: Operators.Email }],
          },
        ];
        const data = { email: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS URL OPERATOR :: //
  ///////////////////////////

  describe("isUrlOperator", () => {
    it("should return true for a valid url", () => {
      const text = "https://www.google.com";
      expect(isUrlOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isUrlOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isUrlOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains url as string", () => {
      const text = "url";
      expect(isUrlOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isUrl Operator", () => {
      it("should return true for a valid url", async () => {
        const conditions = [
          {
            and: [{ field: "url", operator: Operators.Url }],
          },
        ];
        const data = { url: "https://www.google.com" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "url", operator: Operators.Url }],
          },
        ];
        const data = { url: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "url", operator: Operators.Url }],
          },
        ];
        const data = { url: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS UUID OPERATOR :: //
  ///////////////////////////

  describe("isUuidOperator", () => {
    it("should return true for a valid UUID", () => {
      const text = "550e8400-e29b-41d4-a716-446655440000";
      expect(isUuidOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isUuidOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isUuidOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains UUID as string", () => {
      const text = "uuid";
      expect(isUuidOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isUuid Operator", () => {
      it("should return true for a valid UUID", async () => {
        const conditions = [
          {
            and: [{ field: "uuid", operator: Operators.UUID }],
          },
        ];
        const data = { uuid: "550e8400-e29b-41d4-a716-446655440000" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "uuid", operator: Operators.UUID }],
          },
        ];
        const data = { uuid: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "uuid", operator: Operators.UUID }],
          },
        ];
        const data = { uuid: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS ALPHA OPERATOR :: //
  ///////////////////////////

  describe("isAlphaOperator", () => {
    it("should return true for a valid alpha", () => {
      const text = "abc";
      expect(isAlphaOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isAlphaOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "123abc";
      expect(isAlphaOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isAlpha Operator", () => {
      it("should return true for a valid alpha", async () => {
        const conditions = [
          {
            and: [{ field: "alpha", operator: Operators.Alpha }],
          },
        ];
        const data = { alpha: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "alpha", operator: Operators.Alpha }],
          },
        ];
        const data = { alpha: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "alpha", operator: Operators.Alpha }],
          },
        ];
        const data = { alpha: "123abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS PERSIAN ALPHA OPERATOR :: //
  ///////////////////////////

  describe("isPersianAlphaOperator", () => {
    it("should return true for a valid persian alpha", () => {
      const text = "پارسی";
      expect(isPersianAlphaOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isPersianAlphaOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "123پارسی";
      expect(isPersianAlphaOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains persian alpha as string", () => {
      const text = "persian";
      expect(isPersianAlphaOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isPersianAlpha Operator", () => {
      it("should return true for a valid persian alpha", async () => {
        const conditions = [
          {
            and: [{ field: "persian", operator: Operators.PersianAlpha }],
          },
        ];
        const data = { persian: "پارسی" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "persian", operator: Operators.PersianAlpha }],
          },
        ];
        const data = { persian: "۱۲۳" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "persian", operator: Operators.PersianAlpha }],
          },
        ];
        const data = { persian: "123پارسی" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string contains persian alpha as string", async () => {
        const conditions = [
          {
            and: [{ field: "persian", operator: Operators.PersianAlpha }],
          },
        ];
        const data = { persian: "persian" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS ALPHA NUMERIC OPERATOR :: //
  ///////////////////////////

  describe("isAlphaNumericOperator", () => {
    it("should return true for a valid alpha numeric", () => {
      const text = "abc123";
      expect(isAlphaNumericOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc123$";
      expect(isAlphaNumericOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains alpha numeric as string", () => {
      const text = "alpha numeric";
      expect(isAlphaNumericOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isAlphaNumeric Operator", () => {
      it("should return true for a valid alpha numeric", async () => {
        const conditions = [
          {
            and: [{ field: "alphaNumeric", operator: Operators.AlphaNumeric }],
          },
        ];
        const data = { alphaNumeric: "abc123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "alphaNumeric", operator: Operators.AlphaNumeric }],
          },
        ];
        const data = { alphaNumeric: "abc123$" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string contains alpha numeric as string", async () => {
        const conditions = [
          {
            and: [{ field: "alphaNumeric", operator: Operators.AlphaNumeric }],
          },
        ];
        const data = { alphaNumeric: "alpha numeric" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS PERSIAN ALPHA NUMERIC OPERATOR :: //
  ///////////////////////////

  describe("isPersianAlphaNumericOperator", () => {
    it("should return true for a valid persian alpha numeric", () => {
      const text = "پارسی۱۲۳";
      expect(isPersianAlphaNumericOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "پارسی۱۲۳$a";
      expect(isPersianAlphaNumericOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains persian alpha numeric as string", () => {
      const text = "persian alpha numeric";
      expect(isPersianAlphaNumericOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isPersianAlphaNumeric Operator", () => {
      it("should return true for a valid persian alpha numeric", async () => {
        const conditions = [
          {
            and: [
              {
                field: "persianAlphaNumeric",
                operator: Operators.PersianAlphaNumeric,
              },
            ],
          },
        ];
        const data = { persianAlphaNumeric: "پارسی۱۲۳" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [
              {
                field: "persianAlphaNumeric",
                operator: Operators.PersianAlphaNumeric,
              },
            ],
          },
        ];
        const data = { persianAlphaNumeric: "پارسی۱۲۳$a" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string contains persian alpha numeric as string", async () => {
        const conditions = [
          {
            and: [
              {
                field: "persianAlphaNumeric",
                operator: Operators.PersianAlphaNumeric,
              },
            ],
          },
        ];
        const data = { persianAlphaNumeric: "persian alpha numeric" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS LOWER CASE OPERATOR :: //
  ///////////////////////////

  describe("isLowerCaseOperator", () => {
    it("should return true for a valid lower case", () => {
      const text = "abc";
      expect(isLowerCaseOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "ABC";
      expect(isLowerCaseOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains lower case as string", () => {
      const text = "lower case";
      expect(isLowerCaseOperator(text)).toBeTruthy();
    });

    describe("ruleEngine isLowerCase Operator", () => {
      it("should return true for a valid lower case", async () => {
        const conditions = [
          {
            and: [{ field: "lowerCase", operator: Operators.LowerCase }],
          },
        ];
        const data = { lowerCase: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "lowerCase", operator: Operators.LowerCase }],
          },
        ];
        const data = { lowerCase: "ABC" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for a string contains lower case as string", async () => {
        const conditions = [
          {
            and: [{ field: "lowerCase", operator: Operators.LowerCase }],
          },
        ];
        const data = { lowerCase: "lower case" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });
    });
  });

  ///////////////////////////
  // :: IS UPPER CASE OPERATOR :: //
  ///////////////////////////

  describe("isUpperCaseOperator", () => {
    it("should return true for a valid upper case", () => {
      const text = "ABC";
      expect(isUpperCaseOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isUpperCaseOperator(text)).toBeFalsy();
    });
    it("should return false for a string contains upper case as string", () => {
      const text = "upper case";
      expect(isUpperCaseOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isUpperCase Operator", () => {
      it("should return true for a valid upper case", async () => {
        const conditions = [
          {
            and: [{ field: "upperCase", operator: Operators.UpperCase }],
          },
        ];
        const data = { upperCase: "ABC" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "upperCase", operator: Operators.UpperCase }],
          },
        ];
        const data = { upperCase: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string contains upper case as string", async () => {
        const conditions = [
          {
            and: [{ field: "upperCase", operator: Operators.UpperCase }],
          },
        ];
        const data = { upperCase: "upper case" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS STRING OPERATOR :: //
  ///////////////////////////

  describe("isStringOperator", () => {
    it("should return true for a string", () => {
      const text = "abc";
      expect(isStringOperator(text)).toBeTruthy();
    });
    it("should return false for a number", () => {
      const text = 123;
      expect(isStringOperator(text)).toBeFalsy();
    });
    it("should return false for a boolean", () => {
      const text = true;
      expect(isStringOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isString Operator", () => {
      it("should return true for a string", async () => {
        const conditions = [
          {
            and: [{ field: "string", operator: Operators.String }],
          },
        ];
        const data = { string: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "string", operator: Operators.String }],
          },
        ];
        const data = { string: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a boolean", async () => {
        const conditions = [
          {
            and: [{ field: "string", operator: Operators.String }],
          },
        ];
        const data = { string: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS OBJECT OPERATOR :: //
  ///////////////////////////

  describe("isObjectOperator", () => {
    it("should return true for an object", () => {
      const text = { key: "value" };
      expect(isObjectOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isObjectOperator(text)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      expect(isObjectOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isObject Operator", () => {
      it("should return true for an object", async () => {
        const conditions = [
          {
            and: [{ field: "object", operator: Operators.Object }],
          },
        ];
        const data = { object: { key: "value" } };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "object", operator: Operators.Object }],
          },
        ];
        const data = { object: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "object", operator: Operators.Object }],
          },
        ];
        const data = { object: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS ARRAY OPERATOR :: //
  ///////////////////////////

  describe("isArrayOperator", () => {
    it("should return true for an array", () => {
      const text = [1, 2, 3];
      expect(isArrayOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isArrayOperator(text)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      expect(isArrayOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isArray Operator", () => {
      it("should return true for an array", async () => {
        const conditions = [
          {
            and: [{ field: "array", operator: Operators.Array }],
          },
        ];
        const data = { array: [1, 2, 3] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "array", operator: Operators.Array }],
          },
        ];
        const data = { array: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "array", operator: Operators.Array }],
          },
        ];
        const data = { array: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BOOLEAN STRING OPERATOR :: //
  ///////////////////////////

  describe("isBooleanStringOperator", () => {
    it("should return true for a valid boolean string", () => {
      const text = "true";
      expect(isBooleanStringOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isBooleanStringOperator(text)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = "123";
      expect(isBooleanStringOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isBooleanString Operator", () => {
      it("should return true for a valid boolean string", async () => {
        const conditions = [
          {
            and: [{ field: "boolStr", operator: Operators.BooleanString }],
          },
        ];
        const data = { boolStr: "true" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "boolStr", operator: Operators.BooleanString }],
          },
        ];
        const data = { boolStr: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "boolStr", operator: Operators.BooleanString }],
          },
        ];
        const data = { boolStr: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BOOLEAN NUMBER OPERATOR :: //
  ///////////////////////////

  describe("isBooleanNumberOperator", () => {
    it("should return true for a valid boolean number", () => {
      const text = 1;
      expect(isBooleanNumberOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isBooleanNumberOperator(text)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      expect(isBooleanNumberOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isBooleanNumber Operator", () => {
      it("should return true for a valid boolean number", async () => {
        const conditions = [
          {
            and: [{ field: "boolNum", operator: Operators.BooleanNumber }],
          },
        ];
        const data = { boolNum: 1 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "boolNum", operator: Operators.BooleanNumber }],
          },
        ];
        const data = { boolNum: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [{ field: "boolNum", operator: Operators.BooleanNumber }],
          },
        ];
        const data = { boolNum: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BOOLEAN NUMBER STRING OPERATOR :: //
  ///////////////////////////

  describe("isBooleanNumberStringOperator", () => {
    it("should return true for a valid boolean number string", () => {
      const text = "1";
      expect(isBooleanNumberStringOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isBooleanNumberStringOperator(text)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      expect(isBooleanNumberStringOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isBooleanNumberString Operator", () => {
      it("should return true for a valid boolean number string", async () => {
        const conditions = [
          {
            and: [
              { field: "boolNumStr", operator: Operators.BooleanNumberString },
            ],
          },
        ];
        const data = { boolNumStr: "1" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { boolNumStr: "0" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { boolNumStr: "true" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { boolNumStr: "false" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [
              { field: "boolNumStr", operator: Operators.BooleanNumberString },
            ],
          },
        ];
        const data = { boolNumStr: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [
              { field: "boolNumStr", operator: Operators.BooleanNumberString },
            ],
          },
        ];
        const data = { boolNumStr: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NUMBER OPERATOR :: //
  ///////////////////////////

  describe("isNumberOperator", () => {
    it("should return true for a number", () => {
      const text = 123;
      expect(isNumberOperator(text)).toBeTruthy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isNumberOperator(text)).toBeFalsy();
    });
    it("should return false for a boolean", () => {
      const text = true;
      expect(isNumberOperator(text)).toBeFalsy();
    });
    it("should return false for a NaN", () => {
      const text = Number.NaN;
      expect(isNumberOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isNumber Operator", () => {
      it("should return true for a number", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Number }],
          },
        ];
        const data = { number: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { number: 123.45 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { number: "123" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { number: "123.45" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();

        const data5 = { number: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeFalsy();

        const data6 = { number: false };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data6),
        ).toBeFalsy();

        const data7 = { number: null };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data7),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Number }],
          },
        ];
        const data = { number: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a boolean", async () => {
        const conditions = [
          {
            and: [{ field: "number", operator: Operators.Number }],
          },
        ];
        const data = { number: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS INTEGER OPERATOR :: //
  ///////////////////////////

  describe("isIntegerOperator", () => {
    it("should return true for an integer", () => {
      const text = 123;
      expect(isIntegerOperator(text)).toBeTruthy();
    });
    it("should return false for a float", () => {
      const text = 123.45;
      expect(isIntegerOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isIntegerOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isInteger Operator", () => {
      it("should return true for an integer", async () => {
        const conditions = [
          {
            and: [{ field: "integer", operator: Operators.Integer }],
          },
        ];
        const data = { integer: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a float", async () => {
        const conditions = [
          {
            and: [{ field: "integer", operator: Operators.Integer }],
          },
        ];
        const data = { integer: 123.45 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "integer", operator: Operators.Integer }],
          },
        ];
        const data = { integer: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS FLOAT OPERATOR :: //
  ///////////////////////////

  describe("isFloatOperator", () => {
    it("should return true for a float", () => {
      const text = 123.45;
      expect(isFloatOperator(text)).toBeTruthy();
    });
    it("should return false for an integer", () => {
      const text = 123;
      expect(isFloatOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isFloatOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isFloat Operator", () => {
      it("should return true for a float", async () => {
        const conditions = [
          {
            and: [{ field: "float", operator: Operators.Float }],
          },
        ];
        const data = { float: 123.45 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for an integer", async () => {
        const conditions = [
          {
            and: [{ field: "float", operator: Operators.Float }],
          },
        ];
        const data = { float: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "float", operator: Operators.Float }],
          },
        ];
        const data = { float: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS POSITIVE OPERATOR :: //
  ///////////////////////////

  describe("isPositiveOperator", () => {
    it("should return true for a positive number", () => {
      const text = 123;
      expect(isPositiveOperator(text)).toBeTruthy();
    });
    it("should return false for a negative number", () => {
      const text = -123;
      expect(isPositiveOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isPositiveOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isPositive Operator", () => {
      it("should return true for a positive number", async () => {
        const conditions = [
          {
            and: [{ field: "positive", operator: Operators.Positive }],
          },
        ];
        const data = { positive: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a negative number", async () => {
        const conditions = [
          {
            and: [{ field: "positive", operator: Operators.Positive }],
          },
        ];
        const data = { positive: -123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "positive", operator: Operators.Positive }],
          },
        ];
        const data = { positive: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NEGATIVE OPERATOR :: //
  ///////////////////////////

  describe("isNegativeOperator", () => {
    it("should return true for a negative number", () => {
      const text = -123;
      expect(isNegativeOperator(text)).toBeTruthy();
    });
    it("should return false for a positive number", () => {
      const text = 123;
      expect(isNegativeOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isNegativeOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isNegative Operator", () => {
      it("should return true for a negative number", async () => {
        const conditions = [
          {
            and: [{ field: "negative", operator: Operators.Negative }],
          },
        ];
        const data = { negative: -123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a positive number", async () => {
        const conditions = [
          {
            and: [{ field: "negative", operator: Operators.Negative }],
          },
        ];
        const data = { negative: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "negative", operator: Operators.Negative }],
          },
        ];
        const data = { negative: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS ZERO OPERATOR :: //
  ///////////////////////////

  describe("isZeroOperator", () => {
    it("should return true for zero", () => {
      const text = 0;
      expect(isZeroOperator(text)).toBeTruthy();
    });
    it("should return false for a positive number", () => {
      const text = 123;
      expect(isZeroOperator(text)).toBeFalsy();
    });
    it("should return false for a negative number", () => {
      const text = -123;
      expect(isZeroOperator(text)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      expect(isZeroOperator(text)).toBeFalsy();
    });

    describe("ruleEngine isZero Operator", () => {
      it("should return true for zero", async () => {
        const conditions = [
          {
            and: [{ field: "zero", operator: Operators.Zero }],
          },
        ];
        const data = { zero: 0 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a positive number", async () => {
        const conditions = [
          {
            and: [{ field: "zero", operator: Operators.Zero }],
          },
        ];
        const data = { zero: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a negative number", async () => {
        const conditions = [
          {
            and: [{ field: "zero", operator: Operators.Zero }],
          },
        ];
        const data = { zero: -123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "zero", operator: Operators.Zero }],
          },
        ];
        const data = { zero: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NUMBER BETWEEN OPERATOR :: //
  ///////////////////////////

  describe("isNumberBetweenOperator", () => {
    it("should return true for a number between the range", () => {
      const text = 5;
      const min = 1;
      const max = 10;
      expect(isNumberBetweenOperator(text, [min, max])).toBeTruthy();
    });
    it("should return false for a number outside the range", () => {
      const text = 15;
      const min = 1;
      const max = 10;
      expect(isNumberBetweenOperator(text, [min, max])).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      const min = 1;
      const max = 10;
      expect(isNumberBetweenOperator(text, [min, max])).toBeFalsy();
    });

    describe("ruleEngine isNumberBetween Operator", () => {
      it("should return true for a number between the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "numberBetween",
                operator: Operators.NumberBetween,
                value: [1, 10],
              },
            ],
          },
        ];
        const data = { numberBetween: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number outside the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "numberBetween",
                operator: Operators.NumberBetween,
                value: [1, 10],
              },
            ],
          },
        ];
        const data = { numberBetween: 15 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [
              {
                field: "numberBetween",
                operator: Operators.NumberBetween,
                value: [1, 10],
              },
            ],
          },
        ];
        const data = { numberBetween: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS STRING LENGTH OPERATOR :: //
  ///////////////////////////

  describe("isStringLengthOperator", () => {
    it("should return true for a string with the correct length", () => {
      const text = "abc";
      const length = 3;
      expect(isLengthOperator(text, length)).toBeTruthy();
    });
    it("should return false for a string with the incorrect length", () => {
      const text = "abc";
      const length = 5;
      expect(isLengthOperator(text, length)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      const length = 3;
      expect(isLengthOperator(text, length)).toBeFalsy();
    });

    describe("ruleEngine isStringLength Operator", () => {
      it("should return true for a string with the correct length", async () => {
        const conditions = [
          {
            and: [
              {
                field: "stringLength",
                operator: Operators.StringLength,
                value: 3,
              },
            ],
          },
        ];
        const data = { stringLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string with the incorrect length", async () => {
        const conditions = [
          {
            and: [
              {
                field: "stringLength",
                operator: Operators.StringLength,
                value: 5,
              },
            ],
          },
        ];
        const data = { stringLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [
              {
                field: "stringLength",
                operator: Operators.StringLength,
                value: 3,
              },
            ],
          },
        ];
        const data = { stringLength: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS MIN LENGTH OPERATOR :: //
  ///////////////////////////

  describe("isMinLengthOperator", () => {
    it("should return true for a string with the correct length", () => {
      const text = "abc";
      const length = 3;
      expect(isMinLengthOperator(text, length)).toBeTruthy();
    });
    it("should return false for a string with the incorrect length", () => {
      const text = "abc";
      const length = 5;
      expect(isMinLengthOperator(text, length)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      const length = 3;
      expect(isMinLengthOperator(text, length)).toBeFalsy();
    });

    describe("ruleEngine isMinLength Operator", () => {
      it("should return true for a string with the correct length", async () => {
        const conditions = [
          {
            and: [
              { field: "minLength", operator: Operators.MinLength, value: 3 },
            ],
          },
        ];
        const data = { minLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string with the incorrect length", async () => {
        const conditions = [
          {
            and: [
              { field: "minLength", operator: Operators.MinLength, value: 5 },
            ],
          },
        ];
        const data = { minLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [
              { field: "minLength", operator: Operators.MinLength, value: 3 },
            ],
          },
        ];
        const data = { minLength: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS MAX LENGTH OPERATOR :: //
  ///////////////////////////

  describe("isMaxLengthOperator", () => {
    it("should return true for a string with the correct length", () => {
      const text = "abc";
      const length = 3;
      expect(isMaxLengthOperator(text, length)).toBeTruthy();
    });
    it("should return false for a string with the incorrect length", () => {
      const text = "abc";
      const length = 2;
      expect(isMaxLengthOperator(text, length)).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      const length = 3;
      expect(isMaxLengthOperator(text, length)).toBeFalsy();
    });

    describe("ruleEngine isMaxLength Operator", () => {
      it("should return true for a string with the correct length", async () => {
        const conditions = [
          {
            and: [
              { field: "maxLength", operator: Operators.MaxLength, value: 3 },
            ],
          },
        ];
        const data = { maxLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string with the incorrect length", async () => {
        const conditions = [
          {
            and: [
              { field: "maxLength", operator: Operators.MaxLength, value: 2 },
            ],
          },
        ];
        const data = { maxLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [
              { field: "maxLength", operator: Operators.MaxLength, value: 3 },
            ],
          },
        ];
        const data = { maxLength: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BETWEEN LENGTH OPERATOR :: //
  ///////////////////////////

  describe("isBetweenLengthOperator", () => {
    it("should return true for a string with the correct length", () => {
      const text = "abc";
      const min = 1;
      const max = 5;
      expect(IsLengthBetweenOperator(text, [min, max])).toBeTruthy();
    });
    it("should return false for a string with the incorrect length", () => {
      const text = "abc";
      const min = 5;
      const max = 10;
      expect(IsLengthBetweenOperator(text, [min, max])).toBeFalsy();
    });
    it("should return false for a number", () => {
      const text = 123;
      const min = 1;
      const max = 5;
      expect(IsLengthBetweenOperator(text, [min, max])).toBeFalsy();
    });

    describe("ruleEngine isBetweenLength Operator", () => {
      it("should return true for a string with the correct length", async () => {
        const conditions = [
          {
            and: [
              {
                field: "betweenLength",
                operator: Operators.LengthBetween,
                value: [1, 5],
              },
            ],
          },
        ];
        const data = { betweenLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a string with the incorrect length", async () => {
        const conditions = [
          {
            and: [
              {
                field: "betweenLength",
                operator: Operators.LengthBetween,
                value: [5, 10],
              },
            ],
          },
        ];
        const data = { betweenLength: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a number", async () => {
        const conditions = [
          {
            and: [
              {
                field: "betweenLength",
                operator: Operators.LengthBetween,
                value: [1, 5],
              },
            ],
          },
        ];
        const data = { betweenLength: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS MIN OPERATOR :: //
  ///////////////////////////

  describe("isMinOperator", () => {
    it("should return true for a number greater than the minimum", () => {
      const text = 5;
      const min = 1;
      expect(isMinOperator(text, min)).toBeTruthy();
    });
    it("should return false for a number less than the minimum", () => {
      const text = 5;
      const min = 10;
      expect(isMinOperator(text, min)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      const min = 1;
      expect(isMinOperator(text, min)).toBeFalsy();
    });

    describe("ruleEngine isMin Operator", () => {
      it("should return true for a number greater than the minimum", async () => {
        const conditions = [
          {
            and: [{ field: "min", operator: Operators.Min, value: 1 }],
          },
        ];
        const data = { min: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number less than the minimum", async () => {
        const conditions = [
          {
            and: [{ field: "min", operator: Operators.Min, value: 10 }],
          },
        ];
        const data = { min: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "min", operator: Operators.Min, value: 1 }],
          },
        ];
        const data = { min: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS MAX OPERATOR :: //
  ///////////////////////////

  describe("isMaxOperator", () => {
    it("should return true for a number less than the maximum", () => {
      const text = 5;
      const max = 10;
      expect(isMaxOperator(text, max)).toBeTruthy();
    });
    it("should return false for a number greater than the maximum", () => {
      const text = 5;
      const max = 1;
      expect(isMaxOperator(text, max)).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      const max = 10;
      expect(isMaxOperator(text, max)).toBeFalsy();
    });

    describe("ruleEngine isMax Operator", () => {
      it("should return true for a number less than the maximum", async () => {
        const conditions = [
          {
            and: [{ field: "max", operator: Operators.Max, value: 10 }],
          },
        ];
        const data = { max: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number greater than the maximum", async () => {
        const conditions = [
          {
            and: [{ field: "max", operator: Operators.Max, value: 1 }],
          },
        ];
        const data = { max: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [{ field: "max", operator: Operators.Max, value: 10 }],
          },
        ];
        const data = { max: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS BETWEEN OPERATOR :: //
  ///////////////////////////

  describe("isBetweenOperator", () => {
    it("should return true for a number between the range", () => {
      const text = 5;
      const min = 1;
      const max = 10;
      expect(isBetweenOperator(text, [min, max])).toBeTruthy();
    });
    it("should return false for a number outside the range", () => {
      const text = 15;
      const min = 1;
      const max = 10;
      expect(isBetweenOperator(text, [min, max])).toBeFalsy();
    });
    it("should return false for a string", () => {
      const text = "abc";
      const min = 1;
      const max = 10;
      expect(isBetweenOperator(text, [min, max])).toBeFalsy();
    });

    describe("ruleEngine isBetween Operator", () => {
      it("should return true for a number between the range", async () => {
        const conditions = [
          {
            and: [
              { field: "between", operator: Operators.Between, value: [1, 10] },
            ],
          },
        ];
        const data = { between: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a number outside the range", async () => {
        const conditions = [
          {
            and: [
              { field: "between", operator: Operators.Between, value: [1, 10] },
            ],
          },
        ];
        const data = { between: 15 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a string", async () => {
        const conditions = [
          {
            and: [
              { field: "between", operator: Operators.Between, value: [1, 10] },
            ],
          },
        ];
        const data = { between: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS FALSY OPERATOR :: //
  ///////////////////////////

  describe("isFalsyOperator", () => {
    it("should return true for a falsy value", () => {
      const text = false;
      expect(isFalsyOperator(text)).toBeTruthy();
      expect(isFalsyOperator(null)).toBeTruthy();
      expect(isFalsyOperator(undefined)).toBeTruthy();
      expect(isFalsyOperator("")).toBeTruthy();
      expect(isFalsyOperator(0)).toBeTruthy();
      expect(isFalsyOperator(Number.NaN)).toBeTruthy();
    });
    it("should return false for a truthy values", () => {
      const text = "abc";
      expect(isFalsyOperator(text)).toBeFalsy();
      expect(isFalsyOperator(1)).toBeFalsy();
      expect(isFalsyOperator({})).toBeFalsy();
      expect(isFalsyOperator([])).toBeFalsy();
    });

    describe("ruleEngine isFalsy Operator", () => {
      it("should return true for a falsy value", async () => {
        const conditions = [
          {
            and: [{ field: "falsy", operator: Operators.Falsy }],
          },
        ];
        const data = { falsy: false };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { falsy: null };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { falsy: undefined };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { falsy: "" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();

        const data5 = { falsy: 0 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeTruthy();

        const data6 = { falsy: Number.NaN };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data6),
        ).toBeTruthy();
      });

      it("should return false for a truthy values", async () => {
        const conditions = [
          {
            and: [{ field: "falsy", operator: Operators.Falsy }],
          },
        ];
        const data = { falsy: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();

        const data2 = { falsy: 1 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { falsy: {} };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { falsy: [] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TRUTHY OPERATOR :: //
  ///////////////////////////

  describe("isTruthyOperator", () => {
    it("should return true for a truthy value", () => {
      const text = true;
      expect(isTruthyOperator(text)).toBeTruthy();
      expect(isTruthyOperator("abc")).toBeTruthy();
      expect(isTruthyOperator(1)).toBeTruthy();
      expect(isTruthyOperator({})).toBeTruthy();
      expect(isTruthyOperator([])).toBeTruthy();
    });
    it("should return false for a falsy value", () => {
      const text = false;
      expect(isTruthyOperator(text)).toBeFalsy();
      expect(isTruthyOperator(null)).toBeFalsy();
      expect(isTruthyOperator(undefined)).toBeFalsy();
      expect(isTruthyOperator("")).toBeFalsy();
      expect(isTruthyOperator(0)).toBeFalsy();
      expect(isTruthyOperator(Number.NaN)).toBeFalsy();
    });

    describe("ruleEngine isTruthy Operator", () => {
      it("should return true for a truthy value", async () => {
        const conditions = [
          {
            and: [{ field: "truthy", operator: Operators.Truthy }],
          },
        ];
        const data = { truthy: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();

        const data2 = { truthy: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeTruthy();

        const data3 = { truthy: 1 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeTruthy();

        const data4 = { truthy: {} };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeTruthy();

        const data5 = { truthy: [] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeTruthy();
      });

      it("should return false for a falsy value", async () => {
        const conditions = [
          {
            and: [{ field: "truthy", operator: Operators.Truthy }],
          },
        ];
        const data = { truthy: false };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();

        const data2 = { truthy: null };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data2),
        ).toBeFalsy();

        const data3 = { truthy: undefined };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data3),
        ).toBeFalsy();

        const data4 = { truthy: "" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data4),
        ).toBeFalsy();

        const data5 = { truthy: 0 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data5),
        ).toBeFalsy();

        const data6 = { truthy: Number.NaN };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data6),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IN OPERATOR :: //
  ///////////////////////////

  describe("inOperator", () => {
    it("should return true for a value in the list", () => {
      const text = "abc";
      const list = ["abc", "def", "ghi"];
      expect(inOperator(text, list)).toBeTruthy();
    });
    it("should return false for a value not in the list", () => {
      const text = "xyz";
      const list = ["abc", "def", "ghi"];
      expect(inOperator(text, list)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const text = "abc";
      expect(inOperator(text, [])).toBeFalsy();
    });

    describe("ruleEngine in Operator", () => {
      it("should return true for a value in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "in",
                operator: Operators.In,
                value: ["abc", "def", "ghi"],
              },
            ],
          },
        ];
        const data = { in: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "in",
                operator: Operators.In,
                value: ["abc", "def", "ghi"],
              },
            ],
          },
        ];
        const data = { in: "xyz" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [{ field: "in", operator: Operators.In, value: [] }],
          },
        ];
        const data = { in: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: CONTAINS OPERATOR :: //
  ///////////////////////////

  describe("containsOperator", () => {
    it("should return true for a value in the list", () => {
      const text = ["abc", "def", "ghi"];
      const value = "abc";
      expect(containsOperator(text, value)).toBeTruthy();
    });
    it("should return false for a value not in the list", () => {
      const text = ["abc", "def", "ghi"];
      const value = "xyz";
      expect(containsOperator(text, value)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const value = "abc";
      expect(containsOperator([], value)).toBeFalsy();
    });

    describe("ruleEngine contains Operator", () => {
      it("should return true for a value in the list", async () => {
        const conditions = [
          {
            and: [
              { field: "contains", operator: Operators.Contains, value: "abc" },
            ],
          },
        ];
        const data = { contains: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              { field: "contains", operator: Operators.Contains, value: "xyz" },
            ],
          },
        ];
        const data = { contains: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [
              { field: "contains", operator: Operators.Contains, value: "abc" },
            ],
          },
        ];
        const data = { contains: [] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: SELF CONTAINS ALL OPERATOR :: //
  ///////////////////////////

  describe("selfContainsAllOperator", () => {
    it("should return false for all values in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "def"];
      expect(selfContainsAllOperator(text, values)).toBeFalsy();
    });
    it("should return false for a value not in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "xyz"];
      expect(selfContainsAllOperator(text, values)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const values = ["abc"];
      expect(selfContainsAllOperator([], values)).toBeFalsy();
    });

    describe("ruleEngine selfContainsAll Operator", () => {
      it("should return false for all values in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAll",
                operator: Operators.SelfContainsAll,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAll: ["abc", "def"], a: "abc", b: "def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAll",
                operator: Operators.SelfContainsAll,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAll: ["abc", "def"], a: "abc", b: "xyz" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAll",
                operator: Operators.SelfContainsAll,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAll: [], a: "abc", b: "def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: SELF CONTAINS ANY OPERATOR :: //
  ///////////////////////////

  describe("selfContainsAnyOperator", () => {
    it("should return false for any value in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "xyz"];
      expect(selfContainsAnyOperator(text, values)).toBeFalsy();
    });
    it("should return false for a value not in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["xyz", "pqr"];
      expect(selfContainsAnyOperator(text, values)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const values = ["abc"];
      expect(selfContainsAnyOperator([], values)).toBeFalsy();
    });

    describe("ruleEngine selfContainsAny Operator", () => {
      it("should return false for any value in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAny",
                operator: Operators.SelfContainsAny,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAny: ["abc", "def"], a: "abc", b: "xyz" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAny",
                operator: Operators.SelfContainsAny,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAny: ["abc", "def"], a: "xyz", b: "pqr" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "selfContainsAny",
                operator: Operators.SelfContainsAny,
                value: ["$.a", "$.b"],
              },
            ],
          },
        ];
        const data = { selfContainsAny: [], a: "abc", b: "def" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: CONTAINS ANY OPERATOR :: //
  ///////////////////////////

  describe("containsAnyOperator", () => {
    it("should return true for any value in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "xyz"];
      expect(containsAnyOperator(text, values)).toBeTruthy();
    });
    it("should return false for a value not in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["xyz", "pqr"];
      expect(containsAnyOperator(text, values)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const values = ["abc"];
      expect(containsAnyOperator([], values)).toBeFalsy();
    });

    describe("ruleEngine containsAny Operator", () => {
      it("should return true for any value in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAny",
                operator: Operators.ContainsAny,
                value: ["abc", "xyz"],
              },
            ],
          },
        ];
        const data = { containsAny: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAny",
                operator: Operators.ContainsAny,
                value: ["xyz", "pqr"],
              },
            ],
          },
        ];
        const data = { containsAny: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAny",
                operator: Operators.ContainsAny,
                value: ["abc"],
              },
            ],
          },
        ];
        const data = { containsAny: [] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: CONTAINS ALL OPERATOR :: //
  ///////////////////////////

  describe("containsAllOperator", () => {
    it("should return true for all values in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "def"];
      expect(containsAllOperator(text, values)).toBeTruthy();
    });
    it("should return false for a value not in the list", () => {
      const text = ["abc", "def", "ghi"];
      const values = ["abc", "xyz"];
      expect(containsAllOperator(text, values)).toBeFalsy();
    });
    it("should return false for an empty list", () => {
      const values = ["abc"];
      expect(containsAllOperator([], values)).toBeFalsy();
    });

    describe("ruleEngine containsAll Operator", () => {
      it("should return true for all values in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAll",
                operator: Operators.ContainsAll,
                value: ["abc", "def"],
              },
            ],
          },
        ];
        const data = { containsAll: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a value not in the list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAll",
                operator: Operators.ContainsAll,
                value: ["abc", "xyz"],
              },
            ],
          },
        ];
        const data = { containsAll: ["abc", "def", "ghi"] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty list", async () => {
        const conditions = [
          {
            and: [
              {
                field: "containsAll",
                operator: Operators.ContainsAll,
                value: ["abc"],
              },
            ],
          },
        ];
        const data = { containsAll: [] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS EMPTY OPERATOR :: //
  ///////////////////////////

  describe("isEmptyOperator", () => {
    it("should return true for an empty value", () => {
      const text = "";
      expect(isEmptyOperator(text)).toBeTruthy();
    });
    it("should return false for a non-empty value", () => {
      const text = "abc";
      expect(isEmptyOperator(text)).toBeFalsy();
    });
  });

  ///////////////////////////
  // :: EQUALS OPERATOR :: //
  ///////////////////////////

  describe("equalsOperator", () => {
    it("should return true for equal values", () => {
      const text = "abc";
      const value = "abc";
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return false for non-equal values", () => {
      const text = "abc";
      const value = "def";
      expect(equalsOperator(text, value)).toBeFalsy();
    });
    it("should return false for different types", () => {
      const text = "abc";
      const value = 123;
      expect(equalsOperator(text, value)).toBeFalsy();
    });
    it("should return true for equal numbers", () => {
      const text = 123;
      const value = 123;
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return true for equal boolean values", () => {
      const text = true;
      const value = true;
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return false for non-equal boolean values", () => {
      const text = true;
      const value = false;
      expect(equalsOperator(text, value)).toBeFalsy();
    });
    it("should return false for null or undefined", () => {
      expect(equalsOperator(undefined, "123")).toBeFalsy();
      expect(equalsOperator("123", undefined)).toBeFalsy();
      expect(equalsOperator(undefined, undefined)).toBeFalsy();

      expect(equalsOperator(null, "123")).toBeFalsy();
      expect(equalsOperator("123", null)).toBeFalsy();
      expect(equalsOperator(null, null)).toBeFalsy();
    });
    it("should return true for equal date values", () => {
      const text = new Date("2020-01-01");
      const value = new Date("2020-01-01");
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return false for non-equal date values", () => {
      const text = new Date("2020-01-01");
      const value = new Date("2020-01-02");
      expect(equalsOperator(text, value)).toBeFalsy();
    });
    it("should return true for equal object values", () => {
      const text = { key: "value" };
      const value = { key: "value" };
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return false for non-equal object values", () => {
      const text = { key: "value" };
      const value = { key: "value2" };
      expect(equalsOperator(text, value)).toBeFalsy();
    });
    it("should return true for equal array values", () => {
      const text = [1, 2, 3];
      const value = [1, 2, 3];
      expect(equalsOperator(text, value)).toBeTruthy();
    });
    it("should return false for non-equal array values", () => {
      const text = [1, 2, 3];
      const value = [1, 2, 4];
      expect(equalsOperator(text, value)).toBeFalsy();
    });

    describe("ruleEngine equals Operator", () => {
      it("should return true for equal values", async () => {
        const conditions = [
          {
            and: [
              { field: "equals", operator: Operators.Equals, value: "abc" },
            ],
          },
        ];
        const data = { equals: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal values", async () => {
        const conditions = [
          {
            and: [
              { field: "equals", operator: Operators.Equals, value: "def" },
            ],
          },
        ];
        const data = { equals: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for different types", async () => {
        const conditions = [
          {
            and: [{ field: "equals", operator: Operators.Equals, value: 123 }],
          },
        ];
        const data = { equals: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for equal numbers", async () => {
        const conditions = [
          {
            and: [{ field: "equals", operator: Operators.Equals, value: 123 }],
          },
        ];
        const data = { equals: 123 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for equal boolean values", async () => {
        const conditions = [
          {
            and: [{ field: "equals", operator: Operators.Equals, value: true }],
          },
        ];
        const data = { equals: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal boolean values", async () => {
        const conditions = [
          {
            and: [
              { field: "equals", operator: Operators.Equals, value: false },
            ],
          },
        ];
        const data = { equals: true };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for equal date values", async () => {
        const conditions = [
          {
            and: [
              {
                field: "equals",
                operator: Operators.Equals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { equals: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal date values", async () => {
        const conditions = [
          {
            and: [
              {
                field: "equals",
                operator: Operators.Equals,
                value: "2020-01-02",
              },
            ],
          },
        ];
        const data = { equals: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for equal object values", async () => {
        const conditions = [
          {
            and: [
              {
                field: "equals",
                operator: Operators.Equals,
                value: { key: "value" },
              },
            ],
          },
        ];
        const data = { equals: { key: "value" } };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal object values", async () => {
        const conditions = [
          {
            and: [
              {
                field: "equals",
                operator: Operators.Equals,
                value: { key: "value2" },
              },
            ],
          },
        ];
        const data = { equals: { key: "value" } };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for equal array values", async () => {
        const conditions = [
          {
            and: [
              { field: "equals", operator: Operators.Equals, value: [1, 2, 3] },
            ],
          },
        ];
        const data = { equals: [1, 2, 3] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal array values", async () => {
        const conditions = [
          {
            and: [
              { field: "equals", operator: Operators.Equals, value: [1, 2, 4] },
            ],
          },
        ];
        const data = { equals: [1, 2, 3] };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: GREATER THAN OPERATOR :: //
  ///////////////////////////

  describe("greaterThanOperator", () => {
    it("should return true for a greater value", () => {
      const text = 5;
      const value = 1;
      expect(greaterThanOperator(text, value)).toBeTruthy();
    });
    it("should return false for a lesser value", () => {
      const text = 5;
      const value = 10;
      expect(greaterThanOperator(text, value)).toBeFalsy();
    });
    it("should return false for an equal value", () => {
      const text = 5;
      const value = 5;
      expect(greaterThanOperator(text, value)).toBeFalsy();
    });
    it("should return false for null or undefined or none equal inputs type", () => {
      expect(greaterThanOperator(undefined, 5)).toBeFalsy();
      expect(greaterThanOperator(5, undefined)).toBeFalsy();
      expect(greaterThanOperator(undefined, undefined)).toBeFalsy();

      expect(greaterThanOperator(null, 5)).toBeFalsy();
      expect(greaterThanOperator(5, null)).toBeFalsy();
      expect(greaterThanOperator(null, null)).toBeFalsy();
      expect(greaterThanOperator(5, "5")).toBeFalsy();
    });

    describe("ruleEngine greaterThan Operator", () => {
      it("should return true for a greater value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThan",
                operator: Operators.GreaterThan,
                value: 1,
              },
            ],
          },
        ];
        const data = { greaterThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a lesser value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThan",
                operator: Operators.GreaterThan,
                value: 10,
              },
            ],
          },
        ];
        const data = { greaterThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThan",
                operator: Operators.GreaterThan,
                value: 5,
              },
            ],
          },
        ];
        const data = { greaterThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: GREATER THAN OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("greaterThanOrEqualOperator", () => {
    it("should return true for a greater value", () => {
      const text = 5;
      const value = 1;
      expect(greaterThanOrEqualsOperator(text, value)).toBeTruthy();
    });
    it("should return false for a lesser value", () => {
      const text = 5;
      const value = 10;
      expect(greaterThanOrEqualsOperator(text, value)).toBeFalsy();
    });
    it("should return true for an equal value", () => {
      const text = 5;
      const value = 5;
      expect(greaterThanOrEqualsOperator(text, value)).toBeTruthy();
    });
    it("should return false for null or undefined", () => {
      expect(greaterThanOrEqualsOperator(undefined, 5)).toBeFalsy();
      expect(greaterThanOrEqualsOperator(5, undefined)).toBeFalsy();
      expect(greaterThanOrEqualsOperator(undefined, undefined)).toBeFalsy();

      expect(greaterThanOrEqualsOperator(null, 5)).toBeFalsy();
      expect(greaterThanOrEqualsOperator(5, null)).toBeFalsy();
      expect(greaterThanOrEqualsOperator(null, null)).toBeFalsy();
    });

    describe("ruleEngine greaterThanOrEqual Operator", () => {
      it("should return true for a greater value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThanOrEqual",
                operator: Operators.GreaterThanOrEquals,
                value: 1,
              },
            ],
          },
        ];
        const data = { greaterThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a lesser value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThanOrEqual",
                operator: Operators.GreaterThanOrEquals,
                value: 10,
              },
            ],
          },
        ];
        const data = { greaterThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for an equal value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "greaterThanOrEqual",
                operator: Operators.GreaterThanOrEquals,
                value: 5,
              },
            ],
          },
        ];
        const data = { greaterThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });
    });
  });

  ///////////////////////////
  // :: LESS THAN OPERATOR :: //
  ///////////////////////////

  describe("lessThanOperator", () => {
    it("should return true for a lesser value", () => {
      const text = 5;
      const value = 10;
      expect(lessThanOperator(text, value)).toBeTruthy();
    });
    it("should return false for a greater value", () => {
      const text = 5;
      const value = 1;
      expect(lessThanOperator(text, value)).toBeFalsy();
    });
    it("should return false for an equal value", () => {
      const text = 5;
      const value = 5;
      expect(lessThanOperator(text, value)).toBeFalsy();
    });
    it("should return false for null or undefined or none equal inputs type", () => {
      expect(lessThanOperator(undefined, 5)).toBeFalsy();
      expect(lessThanOperator(5, undefined)).toBeFalsy();
      expect(lessThanOperator(undefined, undefined)).toBeFalsy();

      expect(lessThanOperator(null, 5)).toBeFalsy();
      expect(lessThanOperator(5, null)).toBeFalsy();
      expect(lessThanOperator(5, "5")).toBeFalsy();
    });

    describe("ruleEngine lessThan Operator", () => {
      it("should return true for a lesser value", async () => {
        const conditions = [
          {
            and: [
              { field: "lessThan", operator: Operators.LessThan, value: 10 },
            ],
          },
        ];
        const data = { lessThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a greater value", async () => {
        const conditions = [
          {
            and: [
              { field: "lessThan", operator: Operators.LessThan, value: 1 },
            ],
          },
        ];
        const data = { lessThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal value", async () => {
        const conditions = [
          {
            and: [
              { field: "lessThan", operator: Operators.LessThan, value: 5 },
            ],
          },
        ];
        const data = { lessThan: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: LESS THAN OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("lessThanOrEqualOperator", () => {
    it("should return true for a lesser value", () => {
      const text = 5;
      const value = 10;
      expect(lessThanOrEqualsOperator(text, value)).toBeTruthy();
    });
    it("should return false for a greater value", () => {
      const text = 5;
      const value = 1;
      expect(lessThanOrEqualsOperator(text, value)).toBeFalsy();
    });
    it("should return true for an equal value", () => {
      const text = 5;
      const value = 5;
      expect(lessThanOrEqualsOperator(text, value)).toBeTruthy();
    });
    it("should return false for null or undefined", () => {
      expect(lessThanOrEqualsOperator(undefined, 5)).toBeFalsy();
      expect(lessThanOrEqualsOperator(5, undefined)).toBeFalsy();
      expect(lessThanOrEqualsOperator(undefined, undefined)).toBeFalsy();

      expect(lessThanOrEqualsOperator(null, 5)).toBeFalsy();
      expect(lessThanOrEqualsOperator(5, null)).toBeFalsy();
      expect(lessThanOrEqualsOperator(null, null)).toBeFalsy();
    });

    describe("ruleEngine lessThanOrEqual Operator", () => {
      it("should return true for a lesser value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "lessThanOrEqual",
                operator: Operators.LessThanOrEquals,
                value: 10,
              },
            ],
          },
        ];
        const data = { lessThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a greater value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "lessThanOrEqual",
                operator: Operators.LessThanOrEquals,
                value: 1,
              },
            ],
          },
        ];
        const data = { lessThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for an equal value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "lessThanOrEqual",
                operator: Operators.LessThanOrEquals,
                value: 5,
              },
            ],
          },
        ];
        const data = { lessThanOrEqual: 5 };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });
    });
  });

  ///////////////////////////
  // :: IS Existent In Object OPERATOR :: //
  ///////////////////////////

  describe("isExistentInObjectOperator", () => {
    it("should return true for a value in the object", () => {
      const key = "key";
      const obj = { key: "abc" };
      expect(isExistsInObjectOperator(key, obj)).toBeTruthy();
    });
    it("should return false for a value not in the object", () => {
      const text = "xyz";
      const obj = { key: "abc" };
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });
    it("should return false for an empty object", () => {
      const text = "abc";
      const obj = {};
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });
    it("should return false for a non-object", () => {
      const text = "abc";
      const obj = "abc";
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });
    it("should return false for a non-string value", () => {
      const text = 123;
      const obj = { key: "abc" };
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });
    it("should return false for a non-string key", () => {
      const text = "abc";
      const obj = { key: 123 };
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });
    it("should return false for none object", () => {
      const text = "abc";
      const obj = "abc";
      expect(isExistsInObjectOperator(text, obj)).toBeFalsy();
    });

    describe("ruleEngine isExistentInObject Operator", () => {
      it("should return true for a value in the object", async () => {
        const conditions = [
          {
            and: [
              { field: "$.isExistentInObject.key", operator: Operators.Exists },
            ],
          },
        ];
        const data = { isExistentInObject: { key: "abc" } };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a value not in the object", async () => {
        const conditions = [
          {
            and: [
              { field: "$.isExistentInObject.key", operator: Operators.Exists },
            ],
          },
        ];
        const data = { isExistentInObject: {} };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an empty object", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isExistentInObject",
                operator: Operators.Exists,
                value: "abc",
              },
            ],
          },
        ];
        const data = { isExistentInObject: {} };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a non-object", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isExistentInObject",
                operator: Operators.Exists,
                value: "abc",
              },
            ], // value will be ignored
          },
        ];
        const data = { isExistentInObject: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for a nested field selection on criteria", async () => {
        const conditions = [
          {
            and: [{ field: "$.data.field", operator: Operators.Exists }],
          },
        ];
        const data = {
          data: {
            field: "test",
          },
        };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a nested missing field selection on criteria", async () => {
        const conditions = [
          {
            and: [{ field: "$.data.field", operator: Operators.Exists }],
          },
        ];
        const data = {
          data: {
            fieldB: "test",
          },
        };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS NULL OR UNDEFINED OPERATOR :: //
  ///////////////////////////

  describe("isNullOrUndefinedOperator", () => {
    it("should return true for a null value", () => {
      const text = null;
      expect(isNullOrUndefinedOperator(text)).toBeTruthy();
    });
    it("should return false for a non-null value", () => {
      const text = "abc";
      expect(isNullOrUndefinedOperator(text)).toBeFalsy();
    });
    it("should return false for an undefined value", () => {
      const text = undefined;
      expect(isNullOrUndefinedOperator(text)).toBeTruthy();
    });
    it("should return false for a non-undefined value", () => {
      const text = "abc";
      expect(isNullOrUndefinedOperator(text)).toBeFalsy();
      expect(isNullOrUndefinedOperator(0)).toBeFalsy();
      expect(isNullOrUndefinedOperator(false)).toBeFalsy();
      expect(isNullOrUndefinedOperator("")).toBeFalsy();
    });

    describe("ruleEngine isNullOrUndefined Operator", () => {
      it("should return true for a null value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isNullOrUndefined",
                operator: Operators.NullOrUndefined,
              },
            ],
          },
        ];
        const data = { isNullOrUndefined: null };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a non-null value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isNullOrUndefined",
                operator: Operators.NullOrUndefined,
              },
            ],
          },
        ];
        const data = { isNullOrUndefined: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return true for an undefined value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isNullOrUndefined",
                operator: Operators.NullOrUndefined,
              },
            ],
          },
        ];
        const data = { isNullOrUndefined: undefined };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a non-undefined value", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isNullOrUndefined",
                operator: Operators.NullOrUndefined,
              },
            ],
          },
        ];
        const data = { isNullOrUndefined: "abc" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE AFTER OPERATOR :: //
  ///////////////////////////

  describe("isDateAfterOperator", () => {
    it("should return true for a date after the specified date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2019-01-01");
      expect(isDateAfterOperator(dateA, dateB)).toBeTruthy();
    });
    it("should return false for a date before the specified date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2021-01-01");
      expect(isDateAfterOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an equal date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2020-01-01");
      expect(isDateAfterOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an invalid date of second argument", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("invalid");
      expect(isDateAfterOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an invalid date of first argument", () => {
      const dateA = new Date("invalid");
      const dateB = new Date("2020-01-01");
      expect(isDateAfterOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an invalid date of both arguments", () => {
      const dateA = new Date("invalid");
      const dateB = new Date("invalid");
      expect(isDateAfterOperator(dateA, dateB)).toBeFalsy();
    });

    describe("ruleEngine isDateAfter Operator", () => {
      it("should return true for a date after the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfter",
                operator: Operators.DateAfter,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfter: "2021-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a date before the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfter",
                operator: Operators.DateAfter,
                value: "2021-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfter: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfter",
                operator: Operators.DateAfter,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfter: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfter",
                operator: Operators.DateAfter,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfter: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE BEFORE OPERATOR :: //
  ///////////////////////////

  describe("isDateBeforeOperator", () => {
    it("should return true for a date before the specified date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2021-01-01");
      expect(isDateBeforeOperator(dateA, dateB)).toBeTruthy();
    });
    it("should return false for a date after the specified date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2019-01-01");
      expect(isDateBeforeOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an equal date", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("2020-01-01");
      expect(isDateBeforeOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an invalid date of second argument", () => {
      const dateA = new Date("2020-01-01");
      const dateB = new Date("invalid");
      expect(isDateBeforeOperator(dateA, dateB)).toBeFalsy();
    });
    it("should return false for an invalid date of first argument", () => {
      const dateA = new Date("invalid");
      const dateB = new Date("2020-01-01");
      expect(isDateBeforeOperator(dateA, dateB)).toBeFalsy();
    });

    describe("ruleEngine isDateBefore Operator", () => {
      it("should return true for a date before the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBefore",
                operator: Operators.DateBefore,
                value: "2021-01-01",
              },
            ],
          },
        ];
        const data = { isDateBefore: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a date after the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBefore",
                operator: Operators.DateBefore,
                value: "2019-01-01",
              },
            ],
          },
        ];
        const data = { isDateBefore: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBefore",
                operator: Operators.DateBefore,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateBefore: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBefore",
                operator: Operators.DateBefore,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateBefore: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE AFTER OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("isDateAfterOrEqualOperator", () => {
    it("should return true for a date after the specified date", () => {
      const text = "2020-01-01";
      const date = "2019-01-01";
      expect(isDateAfterOrEqualsOperator(text, date)).toBeTruthy();
    });
    it("should return true for an equal date", () => {
      const text = "2020-01-01";
      const date = "2020-01-01";
      expect(isDateAfterOrEqualsOperator(text, date)).toBeTruthy();
    });
    it("should return false for a date before the specified date", () => {
      const text = "2020-01-01";
      const date = "2021-01-01";
      expect(isDateAfterOrEqualsOperator(text, date)).toBeFalsy();
    });

    describe("ruleEngine isDateAfterOrEqual Operator", () => {
      it("should return true for a date after the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfterOrEqual",
                operator: Operators.DateAfterOrEquals,
                value: "2019-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfterOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for an equal date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfterOrEqual",
                operator: Operators.DateAfterOrEquals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfterOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a date before the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfterOrEqual",
                operator: Operators.DateAfterOrEquals,
                value: "2021-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfterOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateAfterOrEqual",
                operator: Operators.DateAfterOrEquals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateAfterOrEqual: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE BEFORE OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("isDateBeforeOrEqualOperator", () => {
    it("should return true for a date before the specified date", () => {
      const text = "2020-01-01";
      const date = "2021-01-01";
      expect(isDateBeforeOrEqualsOperator(text, date)).toBeTruthy();
    });
    it("should return true for an equal date", () => {
      const text = "2020-01-01";
      const date = "2020-01-01";
      expect(isDateBeforeOrEqualsOperator(text, date)).toBeTruthy();
    });
    it("should return false for a date after the specified date", () => {
      const text = "2020-01-01";
      const date = "2019-01-01";
      expect(isDateBeforeOrEqualsOperator(text, date)).toBeFalsy();
    });

    describe("ruleEngine isDateBeforeOrEqual Operator", () => {
      it("should return true for a date before the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBeforeOrEqual",
                operator: Operators.DateBeforeOrEquals,
                value: "2021-01-01",
              },
            ],
          },
        ];
        const data = { isDateBeforeOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for an equal date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBeforeOrEqual",
                operator: Operators.DateBeforeOrEquals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateBeforeOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a date after the specified date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBeforeOrEqual",
                operator: Operators.DateBeforeOrEquals,
                value: "2019-01-01",
              },
            ],
          },
        ];
        const data = { isDateBeforeOrEqual: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBeforeOrEqual",
                operator: Operators.DateBeforeOrEquals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateBeforeOrEqual: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE EQUALS OPERATOR :: //
  ///////////////////////////

  describe("isDateEqualsOperator", () => {
    it("should return true for equal dates", () => {
      const text = "2020-01-01";
      const date = "2020-01-01";
      expect(isDateEqualsOperator(text, date)).toBeTruthy();
    });
    it("should return false for non-equal dates", () => {
      const text = "2020-01-01";
      const date = "2020-01-02";
      expect(isDateEqualsOperator(text, date)).toBeFalsy();
    });

    describe("ruleEngine isDateEquals Operator", () => {
      it("should return true for equal dates", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateEquals",
                operator: Operators.DateEquals,
                value: "2020-01-01",
              },
            ],
          },
        ];
        const data = { isDateEquals: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal dates", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateEquals",
                operator: Operators.DateEquals,
                value: "2020-01-02",
              },
            ],
          },
        ];
        const data = { isDateEquals: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS DATE BETWEEN OPERATOR :: //
  ///////////////////////////

  describe("isDateBetweenOperator", () => {
    it("should return true for a date between the range", () => {
      const text = "2020-01-01";
      const min = "2019-01-01";
      const max = "2021-01-01";
      expect(isDateBetweenOperator(text, [min, max])).toBeTruthy();
    });
    it("should return false for a date outside the range", () => {
      const text = "2020-01-01";
      const min = "2021-01-01";
      const max = "2022-01-01";
      expect(isDateBetweenOperator(text, [min, max])).toBeFalsy();
    });

    describe("ruleEngine isDateBetween Operator", () => {
      it("should return true for a date between the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBetween",
                operator: Operators.DateBetween,
                value: ["2019-01-01", "2021-01-01"],
              },
            ],
          },
        ];
        const data = { isDateBetween: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a date outside the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBetween",
                operator: Operators.DateBetween,
                value: ["2021-01-01", "2022-01-01"],
              },
            ],
          },
        ];
        const data = { isDateBetween: "2020-01-01" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid date", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isDateBetween",
                operator: Operators.DateBetween,
                value: ["2019-01-01", "2021-01-01"],
              },
            ],
          },
        ];
        const data = { isDateBetween: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME AFTER OPERATOR :: //
  ///////////////////////////

  describe("isTimeAfterOperator", () => {
    it("should return true for a time after the specified time", () => {
      const text = "12:00";
      const time = "11:00";
      expect(isTimeAfterOperator(text, time)).toBeTruthy();
    });
    it("should return false for a time before the specified time", () => {
      const text = "12:00";
      const time = "13:00";
      expect(isTimeAfterOperator(text, time)).toBeFalsy();
    });
    it("should return false for an equal time", () => {
      const text = "12:00";
      const time = "12:00";
      expect(isTimeAfterOperator(text, time)).toBeFalsy();
    });

    describe("ruleEngine isTimeAfter Operator", () => {
      it("should return true for a time after the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfter",
                operator: Operators.TimeAfter,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeAfter: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a time before the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfter",
                operator: Operators.TimeAfter,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeAfter: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfter",
                operator: Operators.TimeAfter,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeAfter: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfter",
                operator: Operators.TimeAfter,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeAfter: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME BEFORE OPERATOR :: //
  ///////////////////////////

  describe("isTimeBeforeOperator", () => {
    it("should return true for a time before the specified time", () => {
      const text = "12:00";
      const time = "13:00";
      expect(isTimeBeforeOperator(text, time)).toBeTruthy();
    });
    it("should return false for a time after the specified time", () => {
      const text = "12:00";
      const time = "11:00";
      expect(isTimeBeforeOperator(text, time)).toBeFalsy();
    });
    it("should return false for an equal time", () => {
      const text = "12:00";
      const time = "12:00";
      expect(isTimeBeforeOperator(text, time)).toBeFalsy();
    });

    describe("ruleEngine isTimeBefore Operator", () => {
      it("should return true for a time before the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBefore",
                operator: Operators.TimeBefore,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeBefore: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a time after the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBefore",
                operator: Operators.TimeBefore,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeBefore: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an equal time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBefore",
                operator: Operators.TimeBefore,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeBefore: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBefore",
                operator: Operators.TimeBefore,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeBefore: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME AFTER OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("isTimeAfterOrEqualOperator", () => {
    it("should return true for a time after the specified time", () => {
      const leftTime = "12:00";
      const rightTime = "11:00";
      expect(isTimeAfterOrEqualsOperator(leftTime, rightTime)).toBeTruthy();
    });
    it("should return true for an equal time", () => {
      const leftTime = "12:00";
      const rightTime = "12:00";
      expect(isTimeAfterOrEqualsOperator(leftTime, rightTime)).toBeTruthy();
    });
    it("should return false for a time before the specified time", () => {
      const leftTime = "12:00";
      const rightTime = "13:00";
      expect(isTimeAfterOrEqualsOperator(leftTime, rightTime)).toBeFalsy();
    });

    describe("ruleEngine isTimeAfterOrEqual Operator", () => {
      it("should return true for a time after the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfterOrEqual",
                operator: Operators.TimeAfterOrEquals,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeAfterOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for an equal time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfterOrEqual",
                operator: Operators.TimeAfterOrEquals,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeAfterOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a time before the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfterOrEqual",
                operator: Operators.TimeAfterOrEquals,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeAfterOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeAfterOrEqual",
                operator: Operators.TimeAfterOrEquals,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeAfterOrEqual: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME BEFORE OR EQUAL OPERATOR :: //
  ///////////////////////////

  describe("isTimeBeforeOrEqualOperator", () => {
    it("should return true for a time before the specified time", () => {
      const text = "12:00";
      const time = "13:00";
      expect(isTimeBeforeOrEqualsOperator(text, time)).toBeTruthy();
    });
    it("should return true for an equal time", () => {
      const text = "12:00";
      const time = "12:00";
      expect(isTimeBeforeOrEqualsOperator(text, time)).toBeTruthy();
    });
    it("should return false for a time after the specified time", () => {
      const text = "12:00";
      const time = "11:00";
      expect(isTimeBeforeOrEqualsOperator(text, time)).toBeFalsy();
    });

    it("should return false for an invalid time", () => {
      const text = "12:00";
      const time = "invalid";
      expect(isTimeBeforeOrEqualsOperator(text, time)).toBeFalsy();
    });

    describe("ruleEngine isTimeBeforeOrEqual Operator", () => {
      it("should return true for a time before the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBeforeOrEqual",
                operator: Operators.TimeBeforeOrEquals,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeBeforeOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return true for an equal time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBeforeOrEqual",
                operator: Operators.TimeBeforeOrEquals,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeBeforeOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a time after the specified time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBeforeOrEqual",
                operator: Operators.TimeBeforeOrEquals,
                value: "11:00",
              },
            ],
          },
        ];
        const data = { isTimeBeforeOrEqual: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBeforeOrEqual",
                operator: Operators.TimeBeforeOrEquals,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeBeforeOrEqual: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME EQUALS OPERATOR :: //
  ///////////////////////////

  describe("isTimeEqualsOperator", () => {
    it("should return true for equal times", () => {
      const text = "12:00";
      const time = "12:00";
      expect(isTimeEqualsOperator(text, time)).toBeTruthy();
    });
    it("should return false for non-equal times", () => {
      const text = "12:00";
      const time = "13:00";
      expect(isTimeEqualsOperator(text, time)).toBeFalsy();
    });

    it("should return false for an invalid time", () => {
      const text = "12:00";
      const time = "invalid";
      expect(isTimeEqualsOperator(text, time)).toBeFalsy();
    });

    describe("ruleEngine isTimeEquals Operator", () => {
      it("should return true for equal times", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeEquals",
                operator: Operators.TimeEquals,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeEquals: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for non-equal times", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeEquals",
                operator: Operators.TimeEquals,
                value: "13:00",
              },
            ],
          },
        ];
        const data = { isTimeEquals: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeEquals",
                operator: Operators.TimeEquals,
                value: "12:00",
              },
            ],
          },
        ];
        const data = { isTimeEquals: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });

  ///////////////////////////
  // :: IS TIME BETWEEN OPERATOR :: //
  ///////////////////////////

  describe("isTimeBetweenOperator", () => {
    it("should return true for a time between the range", () => {
      const text = "12:00";
      const min = "11:00";
      const max = "13:00";
      expect(isTimeBetweenOperator(text, [min, max])).toBeTruthy();
    });
    it("should return false for a time outside the range", () => {
      const text = "12:00";
      const min = "13:00";
      const max = "14:00";
      expect(isTimeBetweenOperator(text, [min, max])).toBeFalsy();
    });

    it("should return false for an invalid time", () => {
      const text = "12:00";
      const min = "invalid";
      const max = "14:00";
      expect(isTimeBetweenOperator(text, [min, max])).toBeFalsy();
    });

    describe("ruleEngine isTimeBetween Operator", () => {
      it("should return true for a time between the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBetween",
                operator: Operators.TimeBetween,
                value: ["11:00", "13:00"],
              },
            ],
          },
        ];
        const data = { isTimeBetween: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeTruthy();
      });

      it("should return false for a time outside the range", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBetween",
                operator: Operators.TimeBetween,
                value: ["13:00", "14:00"],
              },
            ],
          },
        ];
        const data = { isTimeBetween: "12:00" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });

      it("should return false for an invalid time", async () => {
        const conditions = [
          {
            and: [
              {
                field: "isTimeBetween",
                operator: Operators.TimeBetween,
                value: ["11:00", "13:00"],
              },
            ],
          },
        ];
        const data = { isTimeBetween: "invalid" };
        expect(
          await RuleEngine.getEvaluateResult({ conditions }, data),
        ).toBeFalsy();
      });
    });
  });
});
