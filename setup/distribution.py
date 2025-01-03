from filter import get_dataset

dataset = get_dataset("../words/words_filtered.txt")
alphabet = "abcdefghijklmnopqrstuvwxyz"

def compute_contains(s, dataset):
  return list(filter(lambda word: s in word, dataset))

res = []
for c in alphabet:
  c_set = compute_contains(c, dataset)
  for d in alphabet:
    d_set = compute_contains(d, c_set)
    for e in alphabet:
      e_set = compute_contains(e, d_set)
      sub = d + e + c
      print(sub)
      res.append((len(compute_contains(sub, e_set)), sub))

res.sort()
print(res)