---
title: 初学C容易踩的坑
createTime: 2025/09/16 21:22:56
permalink: /article/gih92jmb/
tags:
    - C
---
## `switch` 子句

### 错误案例

```c
    switch (operator)
    {
    case '+':
        res = add(a, b);

    case '-':
        res = minus(a, b);

    case '*':
        res = multiply(a, b);

    case '/':
        res = multiply(a, reciprocal(b));
    }
```

> [!CAUTION]
> 上面的代码不能正确运行。为什么？

答：需要在每一个 `case` 子句末尾加上 `break;` 命令。

> [!TIP]
> 在 C 语言中， `switch` 有一个极其 *\*仙舟粗口\** 的设计，那就是 **贯穿（fallthrough）**，指的是
> 在 `case` 子句中一旦匹配到第一个匹配的条件，就会把后续所有 `case` 子句全部执行，直到遇到 `break;` 或者 大括号（`}`）。
>
> 因此，在多数情况下（不需要贯穿机制的情况下），每一个 `case` 子句末尾都必须加入 `break;` 才能保证代码行为符合预期。

### 正解

```c
    switch (operator)
    {
    case '+':
        res = add(a, b);
        break;

    case '-':
        res = minus(a, b);
        break;

    case '*':
        res = multiply(a, b);
        break;

    case '/':
        res = multiply(a, reciprocal(b));
        break;
    }
```

## `scanf()` 函数

```c
int a, b, c;
scanf("%d%d%d", a, b, c);
```

> [!CAUTION]
> 上面的代码不能正确运行。为什么？

。。。因为 `scanf()` 需要的是变量的引用。就是加了 `&` 的变量。

### 正解

```c
int a, b, c;
scanf("%d%d%d", &a, &b, &c);
```
