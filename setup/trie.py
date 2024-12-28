from __future__ import annotations
from setup.filter import get_dataset
import json

class TrieNode:
  """ At TrieNode represents a node in the Trie that supports both prefix and suffix children.
  """
  def __init__(self):
    self.prefix_children = {}
    self.suffix_children = {}
    self.is_word = False

  def add_prefix_child(self, char: str, node: TrieNode) -> None:
    self.prefix_children[char] = node

  def add_suffix_child(self, char: str, node: TrieNode) -> None:
    self.suffix_children[char] = node

  def set_is_word(self, val=True) -> None:
    self.is_word = val
  
  def indented_str(self, indent):
    ind = " " * indent
    res = [ind, "(", str(self.is_word)]
    if self.prefix_children or self.suffix_children:
      if self.prefix_children:   
        res.append(", {\n")
        for k in sorted(self.prefix_children):
          res.append(ind)
          res.append(" ")
          res.append(k)
          res.append(":\n")
          res.append(self.prefix_children[k].indented_str(indent + 1))
        res.append(ind)
        res.append("}, ")
      else:
        res.append(", {}, ")

      if self.suffix_children:
        res.append("{\n")
        for k in sorted(self.suffix_children):
          res.append(ind)
          res.append(" ")
          res.append(k)
          res.append(":\n")
          res.append(self.suffix_children[k].indented_str(indent + 1))
        res.append(ind)
        res.append("})\n")
      else: 
        res.append(" {})\n")
    else:
      res.append(")\n")

    return "".join(res)

  def __str__(self):
    return self.indented_str(0)
  
def char_to_bit(char):
  """Convert a character to its corresponding bit index."""
  return ord(char) - ord('a')

def set_to_bitset(char_set):
  """Convert a set of characters into a bitset represented as an integer."""
  bitset = 0
  for char in char_set:
    bitset |= 1 << char_to_bit(char)
  return bitset

class TrieNodeEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, TrieNode):
      res = {}
      if obj.prefix_children:
        res["pre"] = set_to_bitset(obj.prefix_children.keys())
      if obj.suffix_children:
        res["suf"] = set_to_bitset(obj.suffix_children.keys())
      if obj.is_word:
        res["wo"] = 1
      return res
    return super().default(obj)

def add_to_trie(nodes, word):
  # Build backwards from TrieNode for word
  nodes.setdefault(word, TrieNode())
  nodes[word].set_is_word()

  q = [word]
  while q:
    next_q = []

    # add left of first node in layer
    first = q[0]
    prefix = first[:-1]
    nodes.setdefault(prefix, TrieNode())
    nodes[prefix].add_suffix_child(first[-1], nodes[first])

    next_q.append(prefix)
    if prefix == "":
      break

    # add right of all nodes except last in layer
    for i in range(len(q) - 1):
      left = q[i]
      right = q[i + 1]
      sub = left[1:]

      nodes.setdefault(sub, TrieNode())
      nodes[sub].add_prefix_child(left[0], nodes[left])
      nodes[sub].add_suffix_child(right[-1], nodes[right])

      next_q.append(sub)

    # add right of last node in layer
    last = q[-1]
    suffix = last[1:]
    nodes.setdefault(suffix, TrieNode())
    nodes[suffix].add_prefix_child(last[0], nodes[last])

    next_q.append(suffix)
    q = next_q

if __name__ == "__main__":
  nodes = {"": TrieNode()}
  dataset = get_dataset("../words/words_filtered.txt")

  i = 0
  for word in dataset:
    i += 1
    add_to_trie(nodes, word)
    if i % 10000 == 0: print("Parsed:", i // 10000)

  print("Total substrings:", len(nodes))

  with open("../words/words_filtered.json", "w") as file:
    file.write("{")
    for i, (key, value) in enumerate(nodes.items()):
      json.dump({key: value}, file, cls=TrieNodeEncoder, separators=(",", ":"), indent=None)
      if i < len(nodes) - 1:
        file.write(",")

      if i % 10000 == 0: print("Wrote:", i // 10000)
    file.write("}")

