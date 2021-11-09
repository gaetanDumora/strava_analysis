path <- "data/all_activities.csv"
df <- read.csv(path, sep = ",", stringsAsFactors = FALSE)

df[df == "undefined" | is.na(df) | df == NULL] <- 0
df$activity_date <- as.Date(df$activity_date)
df[, 5:ncol(df)] <- apply(
    X = df[, 5:ncol(df)],
    MARGIN = 2,
    FUN = as.numeric
)
print(
    str(df)
)

# matrice correllation -1<p<1 les unités de mesure n'ont pas d'impact sur le résultat
cor_mtx <- cor(df[, 5:ncol(df)])
print(cor_mtx)
#
# cov_mtx <- cov(df[, 5:ncol(df)], method = "spearman")
# print(cov_mtx)

corrplot::corrplot(cor_mtx, method = "ellipse")