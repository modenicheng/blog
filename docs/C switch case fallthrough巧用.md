---
title: C switch case fallthrough 巧用
createTime: 2025/10/12 00:19:53
permalink: /article/h8cwhmki/
tags:
 - C
 - fallthrough
---

## 背景

大一。

C 语言程序设计。

作业。

## 题目

再次给出任意一个年月日（年>1900），现在我们不能只是直接计算，要先判断给出的日期是否合法，对于非法的日期要给出错误提示信息，合法的日期要再计算是星期几。

输入：

- 年 月 日

输出：

- 0～6。
- 星期日用 0 表示，星期一用 1 表示，星期二用 2 表示......星期六用 6 表示。

假设年份大于1900。先想一想：~~我们现在只会使用 if 语句~~!!别管这个条件，0 人在意!!，该如何建立数学模型？

| 测试用例   | 测试输入       | 期待的输出           | 时间限制 | 内存限制 | 额外进程 |
| :-------- | ------------- | ------------------ | ------- | :-----: | :-----: |
| 测试用例 1 | 2013 3 11\\n  | 1\\n               | 1秒     |    64M  | 0      |
| 测试用例 2 | 2013 13 15\\n | month is error.\\n | 1秒     |    64M  | 0      |
| 测试用例 3 | 2013 3 32\\n  | day is error.\\n   | 1秒     |    64M  | 0      |

## 示例代码（我写的）

```c :collapsed-lines=40
#include <stdio.h>

int main()
{
    int y, m, d;

    scanf("%d%d%d", &y, &m, &d);

    if (d < 0 || d > 31)
    {
        printf("day is error.\n");
        return 1;
    }
    // [!code focus:41]
    switch (m) // [!code highlight]
    // fallthrough 合并天数相同的月份 // [!code highlight]
    {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
        if (d > 31)
        {
            printf("day is error.\n");
            return 1;
        }
        break;
    case 2:
        if (((y % 400 == 0) || (y % 100 != 0 && y % 4 == 0)) && (d > 29))
        {
            printf("day is error.\n");
            return 1;
        }
        else if (!((y % 400 == 0) || (y % 100 != 0 && y % 4 == 0)) && (d > 28))
        {
            printf("day is error.\n");
            return 1;
        }
    case 4:
    case 6:
    case 9:
    case 11:
        if (d > 30)
        {
            printf("day is error.\n");
            return 1;
        }
        break;
    default:
        printf("month is error.\n");
        return 1;
    }

    if (m <= 2)
    {
        y -= 1;
        m += 12;
    }

    // 计算公式来源：https://blog.csdn.net/whz_zb/article/details/7425260
    // 第四节：基姆拉尔森计算公式（据 blog 作者说这是他命名的）
    int weekday = (d + 2 * m + 3 * (m + 1) / 5 + y + y / 4 - y / 100 + y / 400) % 7 + 1;
    weekday = weekday == 7 ? 0 : weekday;
    printf("%d\n", weekday);
    return 0;
}
```

这段代码，便是通过 switch case 的巧妙使用，将每个月份的天数判断条件合并，从而减少了代码量，提高了代码的可读性。

其实，这东西在我看来更像是 python 中 `in [Array]` 的类似物，不过 C 貌似没这东西？

### 原理解释

`switch case` 语句是 C 中标准的多分支流程控制语句，用于匹配某表达式不同的值。
但是它特殊在于，一旦匹配上某一个 `case` ，它不仅会执行那一个 `case` 下的指令，
还会执行下面所有的 `case` 语句，直到遇到一个 `break;` 或者一个 `}` （这代表整个 `switch` 语句的结束）。

所以， `switch case` 语句通行用法是在每一个 `case` 的末尾加一个 `break;` 来避免这种叫作 `fallthrough` 的现象。

在上面的代码中刻意使用了非标准的写法，让其中的变量 `m` 一旦匹配到某类值（比如大月或者小月）就可以统一执行一份代码；并在这一份统一执行的代码最后 `break` ，退出 `switch`。

例如，当 `m = 1` ，匹配到 `case 1:` ，此时经由 `fallthrough` 的特性，代码会一直执行到 `case 12:` 块中的 `break;` (line 29) 才跳出 `switch` 。
这样就达成了 \*虽然 `case 1:` 啥代码都没写但是依然能够正确执行的效果，同时也减小了代码量。

## 另一个案例

<!--
我知道下面那种一行一个 // [!code highlight] 的写法很蠢，
但是不知道为什么用大括号（花括号）的那种方式不管用
-->

```c :collapsed-lines=45
#include <stdio.h>
int main()
{
    int year, month, day;
    int run = year % 400 == 0 || year % 4 == 0 && year % 100 != 0;
    scanf("%d%d%d", &year, &month, &day);
    int sum1 = (year - 1901) / 4 + (year - 1901) * 365;
    int sum2;
    if (month > 12 || month < 1)
        printf("month is error.\n");
    else
    {
        if (day > 31 || day < 1)
            printf("day is error.\n");
        else if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31)
            printf("day is error.\n");
        else if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30)
            printf("day is error.\n");

        else if (month==2&&(run&&day>29||!run&&day>28)) printf("day is error.\n");

        else
        {
            if (run)
            {
                // [!code focus:39]
                switch (month) // [!code highlight]
                {// [!code highlight]
                case 1:// [!code highlight]
                    sum2 = 0;// [!code highlight]
                    break;// [!code highlight]
                case 2:// [!code highlight]
                    sum2 = 31;// [!code highlight]
                    break;// [!code highlight]
                case 3:// [!code highlight]
                    sum2 = 31 + 29;// [!code highlight]
                    break;// [!code highlight]
                case 4:// [!code highlight]
                    sum2 = 31 + 29 + 31;// [!code highlight]
                    break;// [!code highlight]
                case 5:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30;// [!code highlight]
                    break;// [!code highlight]
                case 6:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31;// [!code highlight]
                    break;// [!code highlight]
                case 7:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30;// [!code highlight]
                    break;// [!code highlight]
                case 8:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30 + 31;// [!code highlight]
                    break;// [!code highlight]
                case 9:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30 + 31 + 31;// [!code highlight]
                    break;// [!code highlight]
                case 10:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30 + 31 + 31 + 30;// [!code highlight]
                    break;// [!code highlight]
                case 11:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31;// [!code highlight]
                    break;// [!code highlight]
                case 12:// [!code highlight]
                    sum2 = 31 + 29 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30;// [!code highlight]
                    break;// [!code highlight]
                }// [!code highlight]
            }
            else
            {
                switch (month)
                {
                case 1:
                    sum2 = 0;
                    break;
                case 2:
                    sum2 = 31;
                    break;
                case 3:
                    sum2 = 31 + 28;
                    break;
                case 4:
                    sum2 = 31 + 28 + 31;
                    break;
                case 5:
                    sum2 = 31 + 28 + 31 + 30;
                    break;
                case 6:
                    sum2 = 31 + 28 + 31 + 30 + 31;
                    break;
                case 7:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30;
                    break;
                case 8:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30 + 31;
                    break;
                case 9:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31;
                    break;
                case 10:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30;
                    break;
                case 11:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31;
                    break;
                case 12:
                    sum2 = 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30;
                    break;
                }
            }
            int sum3 = day;
            int sum = sum1 + sum2 + sum3;
            int yu = sum % 7;
            int date = 1 + yu;
            if (date == 7)
                date = 0;
            printf("%d\n", date);
        }
    }
    return 0;
}
```

其他问题我们暂且不管，只看这一段冗长的 `switch`。

很显然，这么写很麻烦，要复制粘贴很多次。这并不是我们想要的。

那么，有什么优化方式吗？

欸嘿，还真有，还是可以利用 `fallthrough` 特性！

### 改版

```c :collapsed-lines=45
#include <stdio.h>
int main()
{
    int year, month, day;
    int run = year % 400 == 0 || year % 4 == 0 && year % 100 != 0;
    scanf("%d%d%d", &year, &month, &day);
    int sum1 = (year - 1901) / 4 + (year - 1901) * 365;
    int sum2 = 0;
    if (month > 12 || month < 1)
        printf("month is error.\n");
    else
    {
        if (day > 31 || day < 1)
        {
            printf("day is error.\n");
            return 0;
        }
        if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31)
        {
            printf("day is error.\n");
            return 0;
        }
        if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30)
        {
            printf("day is error.\n");
            return 0;
        }
        if (month == 2)
        {
            if (run && (day > 29))
            {
                printf("day is error.\n");
                return 0;
            }
            else if (!run && (day > 28))
            {
                printf("day is error.\n");
                return 0;
            }
        }
        // [!code focus:27]
        switch (month)// [!code highlight]
        {// [!code highlight]
        case 12:// [!code highlight]
            sum2 += 30;// [!code highlight]
        case 11:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 10:// [!code highlight]
            sum2 += 30;// [!code highlight]
        case 9:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 8:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 7:// [!code highlight]
            sum2 += 30;// [!code highlight]
        case 6:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 5:// [!code highlight]
            sum2 += 30;// [!code highlight]
        case 4:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 3:// [!code highlight]
            sum2 += (28 + run);// [!code highlight]
        case 2:// [!code highlight]
            sum2 += 31;// [!code highlight]
        case 1:// [!code highlight]
            sum2 += 0;// [!code highlight]
        }// [!code highlight]
        int sum3 = day;
        int sum = sum1 + sum2 + sum3;
        int yu = sum % 7;
        int date = 1 + yu;
        if (date == 7)
            date = 0;
        printf("%d\n", date);
    }
    return 0;
}
```

这一段高亮的代码则非常简洁而优雅地利用倒序和 `fallthrough` 的特性，依次累加前面各个月份的天数，从而达到了与原来代码相同的效果！

#### 解释

匹配到某个月份，比如 `5` ，那么代码中 `case 12:` 直到 `case 6:` 中的语句都会被忽略，
程序实际上会从 `case 5:` 往后依次执行下面的每一个 `case` 内的 `+=` 操作，
从而避免了程序员手动将诸多数字相加的麻烦。

## 总之

我既被这 b 东西坑过、把它视作 C 中的缺陷与 bug ，但是也在某些奇妙的情境下反过来将这种“bug”为我所用。

有时候，==打开思路、跳出定式==，或许能够另辟蹊径，写出更简洁、更易读的高质量代码。

~~编程，很奇妙吧……~~
